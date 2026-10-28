import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Field, TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import { ReportExportButtons } from '@/components/admin/ReportExportButtons';
import { updateReportAction, togglePublishReportAction } from '../actions';
import type { ReportRow, Indicator } from '@/types/database';

export default async function AdminReportEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: reportRow }, { data: indicators }, { data: linked }] = await Promise.all([
    supabase.from('reports').select('*').eq('id', id).single(),
    supabase.from('indicators').select('*').order('sort_order'),
    supabase.from('report_indicators').select('indicator_id').eq('report_id', id),
  ]);

  if (!reportRow) notFound();
  const report = reportRow as ReportRow;
  const linkedIds = new Set((linked ?? []).map((r: any) => r.indicator_id));

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-navy-800">{report.title}</h1>
        <div className="flex items-center gap-2">
          <ReportExportButtons report={report} />
          <form action={togglePublishReportAction}>
            <input type="hidden" name="id" value={report.id} />
            <input type="hidden" name="status" value={report.status} />
            <button type="submit" className="rounded-full bg-navy-700 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800">
              {report.status === 'published' ? 'إلغاء النشر' : 'اعتماد ونشر'}
            </button>
          </form>
        </div>
      </div>

      {report.generated_by_ai && report.ai_generation_notes && (
        <Card className="border-gold-300 bg-gold-100/40">
          <p className="flex items-start gap-2 text-sm font-semibold text-navy-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            ملاحظات الذكاء الاصطناعي حول معلومات ناقصة: {report.ai_generation_notes}
          </p>
        </Card>
      )}

      <Card>
        <form action={updateReportAction} className="space-y-4">
          <input type="hidden" name="id" value={report.id} />
          <Field label="العنوان"><TextInput name="title" defaultValue={report.title} required /></Field>
          <Field label="مقدمة"><TextArea name="introduction" defaultValue={report.introduction ?? ''} rows={3} /></Field>
          <Field label="وصف المبادرة"><TextArea name="initiative_description" defaultValue={report.initiative_description ?? ''} rows={3} /></Field>
          <Field label="الأهداف"><TextArea name="goals" defaultValue={report.goals ?? ''} rows={2} /></Field>
          <Field label="الفئة المستهدفة"><TextInput name="target_group" defaultValue={report.target_group ?? ''} /></Field>
          <Field label="الجهات المشاركة"><TextArea name="participating_parties" defaultValue={report.participating_parties ?? ''} rows={2} /></Field>
          <Field label="آلية التنفيذ"><TextArea name="execution_mechanism" defaultValue={report.execution_mechanism ?? ''} rows={2} /></Field>
          <Field label="النتائج والإنجازات"><TextArea name="results_achievements" defaultValue={report.results_achievements ?? ''} rows={3} /></Field>
          <Field label="قياس الأثر"><TextArea name="impact_measurement" defaultValue={report.impact_measurement ?? ''} rows={2} /></Field>
          <Field label="التوصيات"><TextArea name="recommendations" defaultValue={report.recommendations ?? ''} rows={2} /></Field>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-navy-700">المؤشرات المرتبطة</label>
            <div className="flex flex-wrap gap-3">
              {(indicators as Indicator[] | null)?.map((ind) => (
                <label key={ind.id} className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-sm">
                  <input type="checkbox" name="indicator_ids" value={ind.id} defaultChecked={linkedIds.has(ind.id)} />
                  {ind.title}
                </label>
              ))}
            </div>
          </div>

          <SubmitButton>حفظ التغييرات</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
