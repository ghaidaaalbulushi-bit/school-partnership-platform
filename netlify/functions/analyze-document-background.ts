import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Background Function — runs with a much longer timeout (up to 15
 * minutes on Netlify) than a normal function (10–26s), which is why PDF
 * analysis lives here rather than in a regular Next.js API route: OCR and
 * long documents can take longer than a synchronous request should wait for.
 * Must be named with the `-background` suffix for Netlify to run it this way.
 *
 * It is invoked by src/app/api/admin/ai/analyze/route.ts, which has already
 * verified the caller is the authenticated admin and created the pending
 * ai_analyses row — this function trusts that and focuses on the actual
 * analysis work.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';

const ANALYSIS_SYSTEM_PROMPT = `أنتِ مساعدة توثيق لمنصة شراكة مدرسية. مهمتك قراءة مستند PDF مرفوع وتصنيفه بدقة بناءً على المؤشرات والأقسام الموجودة فعليًا في قاعدة البيانات، المرسلة إليك أدناه. لا تخترعي مؤشرات أو أقسامًا غير موجودة في القائمة. إن لم يكن أي مؤشر أو قسم مناسبًا بوضوح، اتركي الحقل فارغًا وفسّري السبب. أجيبي حصرًا بكائن JSON واحد مطابق للمخطط التالي، بدون أي نص إضافي:
{
  "document_type": "نوع المستند بالعربية، مثال: محضر اجتماع",
  "summary": "تلخيص موجز لمحتوى المستند (3-5 جمل)",
  "key_info": { "أي حقائق أو تواريخ أو أسماء مهمة مستخرجة من المستند": "..." },
  "suggested_indicator_ids": ["uuid1", "uuid2"],
  "suggested_section_id": "uuid أو null",
  "classification_reasoning": "شرح سبب هذا التصنيف استنادًا إلى محتوى المستند الفعلي",
  "used_ocr": false
}`;

export const handler: Handler = async (event) => {
  const { mediaFileId, aiAnalysisId } = JSON.parse(event.body || '{}');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY غير مضبوط.');

    await supabase.from('ai_analyses').update({ status: 'processing' }).eq('id', aiAnalysisId);

    const { data: mediaFile, error: mediaError } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', mediaFileId)
      .single();
    if (mediaError || !mediaFile) throw new Error('تعذّر العثور على الملف.');

    const { data: signedUrlData, error: signError } = await supabase.storage
      .from(mediaFile.storage_bucket)
      .createSignedUrl(mediaFile.storage_path, 300);
    if (signError || !signedUrlData) throw new Error('تعذّر إنشاء رابط مؤقت للملف.');

    const fileRes = await fetch(signedUrlData.signedUrl);
    if (!fileRes.ok) throw new Error('تعذّر تحميل الملف للتحليل.');
    const arrayBuffer = await fileRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Pull the live indicator/section list so the model only ever classifies
    // against what actually exists — never a hallucinated code or name.
    const { data: indicators } = await supabase.from('indicators').select('id, code, title');
    const { data: sections } = await supabase.from('sections').select('id, title, indicator_id');

    const catalogText = `المؤشرات المتاحة:\n${(indicators ?? [])
      .map((i) => `- ${i.id} :: ${i.code ?? ''} ${i.title}`)
      .join('\n')}\n\nالأقسام المتاحة:\n${(sections ?? [])
      .map((s) => `- ${s.id} :: ${s.title} (تابع للمؤشر ${s.indicator_id})`)
      .join('\n')}`;

    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: catalogText },
              { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      throw new Error(`فشل تحليل الذكاء الاصطناعي: ${anthropicRes.status} ${await anthropicRes.text()}`);
    }

    const json = await anthropicRes.json();
    const textBlock = json.content?.find((b: any) => b.type === 'text');
    if (!textBlock) throw new Error('رد غير متوقع من خدمة الذكاء الاصطناعي.');

    const firstBrace = textBlock.text.indexOf('{');
    const lastBrace = textBlock.text.lastIndexOf('}');
    const parsed = JSON.parse(textBlock.text.slice(firstBrace, lastBrace + 1));

    // Duplicate detection: a very rough heuristic comparing extracted
    // summary text against other completed analyses for the same indicator;
    // flagged for the admin to confirm, never auto-merged or auto-deleted.
    let possibleDuplicateOf: string | null = null;
    if (parsed.summary) {
      const { data: others } = await supabase
        .from('ai_analyses')
        .select('media_file_id, summary')
        .eq('status', 'completed')
        .neq('media_file_id', mediaFileId)
        .limit(50);
      const match = (others ?? []).find(
        (o) => o.summary && similarity(o.summary, parsed.summary) > 0.82
      );
      if (match) possibleDuplicateOf = match.media_file_id;
    }

    await supabase
      .from('ai_analyses')
      .update({
        status: 'completed',
        extracted_text: null, // full text not persisted to limit sensitive-data retention; summary + key_info cover it
        used_ocr: Boolean(parsed.used_ocr),
        document_type: parsed.document_type ?? null,
        summary: parsed.summary ?? null,
        key_info: parsed.key_info ?? null,
        suggested_indicator_ids: parsed.suggested_indicator_ids ?? null,
        suggested_section_id: parsed.suggested_section_id ?? null,
        classification_reasoning: parsed.classification_reasoning ?? null,
        possible_duplicate_of: possibleDuplicateOf,
      })
      .eq('id', aiAnalysisId);
  } catch (err: any) {
    await supabase
      .from('ai_analyses')
      .update({ status: 'failed', error_message: String(err?.message ?? err) })
      .eq('id', aiAnalysisId);
  }

  return { statusCode: 200, body: 'ok' };
};

/** Very small Jaccard-similarity-over-words heuristic — good enough to flag
 * "these two summaries look suspiciously alike" for a human to check, not
 * meant to be a real document-dedup algorithm. */
function similarity(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/\s+/));
  const wb = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return union === 0 ? 0 : intersection / union;
}
