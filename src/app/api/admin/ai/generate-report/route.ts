import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';
import { callAnthropic, extractJson, isAiConfigured } from '@/lib/ai/anthropic';
import { logAudit } from '@/lib/admin/audit';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `أنتِ مساعدة توثيق لمنصة شراكة مدرسية عُمانية. ستتلقين بيانات مبادرة مدرسية حقيقية كما أدخلها المستخدم، ومطلوب منك صياغتها في تقرير توثيقي منظم ومهني بالعربية الفصحى.
قواعد صارمة:
- ممنوع اختراع أي نتيجة أو رقم أو اسم جهة أو تاريخ غير موجود في البيانات المُعطاة.
- إن كانت بيانات حقل ناقصة، اكتبي في ذلك الحقل: "يُرجى استكمال هذه المعلومة" بدل اختلاقها، واذكريها في notes_on_missing_info.
- حافظي على الوقائع كما وردت، وأعيدي الصياغة فقط لتحسين الأسلوب والتنظيم.
أجيبي حصرًا بكائن JSON بالمخطط التالي، بدون أي نص إضافي:
{
  "title": "عنوان التقرير",
  "introduction": "مقدمة قصيرة",
  "initiative_description": "وصف المبادرة بصياغة تقريرية",
  "results_achievements": "النتائج والإنجازات",
  "recommendations": "التوصيات",
  "notes_on_missing_info": "ما هي الحقول التي كانت ناقصة في البيانات الأصلية، إن وجدت"
}`;

export async function POST(request: NextRequest) {
  const { user, supabase } = await requireAdmin();

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: 'لم يتم تفعيل خدمة الذكاء الاصطناعي بعد. أضيفي ANTHROPIC_API_KEY إلى متغيرات بيئة Netlify.' },
      { status: 400 }
    );
  }

  const { initiativeId } = await request.json();
  if (!initiativeId) return NextResponse.json({ error: 'لم يتم تحديد المبادرة.' }, { status: 400 });

  const { data: initiative, error: fetchError } = await supabase
    .from('initiatives')
    .select('*, initiative_indicators(indicator_id)')
    .eq('id', initiativeId)
    .single();

  if (fetchError || !initiative) return NextResponse.json({ error: 'تعذّر العثور على المبادرة.' }, { status: 404 });

  const sourceDataText = JSON.stringify(
    {
      العنوان: initiative.title,
      الوصف: initiative.description,
      تاريخ_التنفيذ: initiative.execution_date,
      المكان: initiative.location,
      الفئة_المستهدفة: initiative.target_group,
      الجهات_المشاركة: initiative.participating_parties,
      الأهداف: initiative.goals,
      آلية_التنفيذ: initiative.execution_mechanism,
      النتائج: initiative.results,
      قياس_الأثر: initiative.impact_measurement,
      التوصيات: initiative.recommendations,
    },
    null,
    2
  );

  let generated: {
    title: string;
    introduction: string;
    initiative_description: string;
    results_achievements: string;
    recommendations: string;
    notes_on_missing_info: string;
  };

  try {
    const responseText = await callAnthropic({
      system: SYSTEM_PROMPT,
      userContent: [{ type: 'text', text: sourceDataText }],
      maxTokens: 2048,
    });
    generated = extractJson(responseText);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }

  const { data: report, error: insertError } = await supabase
    .from('reports')
    .insert({
      title: generated.title,
      introduction: generated.introduction,
      initiative_description: generated.initiative_description,
      goals: initiative.goals,
      target_group: initiative.target_group,
      participating_parties: initiative.participating_parties,
      execution_mechanism: initiative.execution_mechanism,
      results_achievements: generated.results_achievements,
      impact_measurement: initiative.impact_measurement,
      recommendations: generated.recommendations,
      source_initiative_id: initiativeId,
      generated_by_ai: true,
      ai_generation_notes: generated.notes_on_missing_info || null,
      status: 'draft',
      created_by: user.id,
    })
    .select()
    .single();

  if (insertError || !report) {
    return NextResponse.json({ error: `تعذّر حفظ التقرير: ${insertError?.message}` }, { status: 500 });
  }

  const indicatorIds = (initiative.initiative_indicators ?? []).map((ii: any) => ii.indicator_id);
  if (indicatorIds.length > 0) {
    await supabase.from('report_indicators').insert(indicatorIds.map((indicator_id: string) => ({ report_id: report.id, indicator_id })));
  }

  await logAudit(supabase, user, { action: 'create', entityType: 'reports', entityId: report.id, afterData: { generated_by_ai: true } });

  return NextResponse.json({ reportId: report.id });
}
