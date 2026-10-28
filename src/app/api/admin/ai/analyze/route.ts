import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';
import { isAiConfigured } from '@/lib/ai/anthropic';

export const runtime = 'nodejs';

/**
 * Starts (or restarts) AI analysis for an uploaded PDF. Creates a pending
 * ai_analyses row immediately, then hands off the actual work to the
 * Netlify background function (netlify/functions/analyze-document-background.ts)
 * so this request returns fast regardless of how long OCR/analysis takes —
 * per the project's requirement to use async processing for long PDF work
 * rather than one long-held request that can time out.
 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await requireAdmin();

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: 'لم يتم تفعيل خدمة الذكاء الاصطناعي بعد. أضيفي ANTHROPIC_API_KEY إلى متغيرات بيئة Netlify.' },
      { status: 400 }
    );
  }

  const { mediaFileId } = await request.json();
  if (!mediaFileId) {
    return NextResponse.json({ error: 'لم يتم تحديد الملف.' }, { status: 400 });
  }

  const { data: mediaFile } = await supabase.from('media_files').select('id, file_type').eq('id', mediaFileId).single();
  if (!mediaFile) return NextResponse.json({ error: 'الملف غير موجود.' }, { status: 404 });
  if (mediaFile.file_type !== 'pdf') {
    return NextResponse.json({ error: 'التحليل الذكي متاح حاليًا لملفات PDF فقط.' }, { status: 400 });
  }

  // Allow re-analysis: remove any prior analysis for this file first.
  await supabase.from('ai_analyses').delete().eq('media_file_id', mediaFileId);

  const { data: analysis, error } = await supabase
    .from('ai_analyses')
    .insert({ media_file_id: mediaFileId, status: 'pending' })
    .select()
    .single();

  if (error || !analysis) {
    return NextResponse.json({ error: 'تعذّر إنشاء سجل التحليل.' }, { status: 500 });
  }

  const siteUrl = process.env.URL || process.env.DEPLOY_URL || '';
  try {
    await fetch(`${siteUrl}/.netlify/functions/analyze-document-background`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mediaFileId, aiAnalysisId: analysis.id }),
    });
  } catch {
    // Local dev without `netlify dev` running won't have this endpoint —
    // the analysis row stays 'pending' and the admin sees a clear status
    // rather than a silent failure.
  }

  return NextResponse.json({ analysisId: analysis.id, status: 'pending' });
}
