import { notFound } from 'next/navigation';
import { Trash2, ExternalLink } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Field, TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import { GenerateReportButton } from '@/components/admin/GenerateReportButton';
import {
  updateInitiativeAction,
  attachInitiativeMediaAction,
  removeInitiativeMediaAction,
  addInitiativeLinkAction,
  deleteInitiativeLinkAction,
} from '../actions';
import type { Initiative, Indicator, MediaFile } from '@/types/database';

export default async function AdminInitiativeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: initiativeRow }, { data: indicators }, { data: mediaFiles }, { data: linkedIndicators }, { data: initiativeMedia }, { data: initiativeLinks }] =
    await Promise.all([
      supabase.from('initiatives').select('*').eq('id', id).single(),
      supabase.from('indicators').select('*').order('sort_order'),
      supabase.from('media_files').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('initiative_indicators').select('indicator_id').eq('initiative_id', id),
      supabase.from('initiative_media').select('media_file:media_files(*)').eq('initiative_id', id),
      supabase.from('initiative_links').select('*').eq('initiative_id', id),
    ]);

  if (!initiativeRow) notFound();
  const initiative = initiativeRow as Initiative;
  const linkedIds = new Set((linkedIndicators ?? []).map((r: any) => r.indicator_id));

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-navy-800">تعديل المبادرة</h1>
        <GenerateReportButton initiativeId={initiative.id} />
      </div>

      <Card>
        <form action={updateInitiativeAction} className="space-y-4">
          <input type="hidden" name="id" value={initiative.id} />
          <Field label="اسم المبادرة"><TextInput name="title" defaultValue={initiative.title} required /></Field>
          <Field label="وصف المبادرة"><TextArea name="description" defaultValue={initiative.description ?? ''} rows={3} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="تاريخ التنفيذ"><TextInput name="execution_date" type="date" defaultValue={initiative.execution_date ?? ''} /></Field>
            <Field label="مكان التنفيذ"><TextInput name="location" defaultValue={initiative.location ?? ''} /></Field>
          </div>
          <Field label="الفئة المستهدفة"><TextInput name="target_group" defaultValue={initiative.target_group ?? ''} /></Field>
          <Field label="الجهات المشاركة"><TextArea name="participating_parties" defaultValue={initiative.participating_parties ?? ''} rows={2} /></Field>
          <Field label="الأهداف"><TextArea name="goals" defaultValue={initiative.goals ?? ''} rows={2} /></Field>
          <Field label="آلية التنفيذ"><TextArea name="execution_mechanism" defaultValue={initiative.execution_mechanism ?? ''} rows={2} /></Field>
          <Field label="النتائج"><TextArea name="results" defaultValue={initiative.results ?? ''} rows={2} /></Field>
          <Field label="قياس الأثر ومدى الانتشار"><TextArea name="impact_measurement" defaultValue={initiative.impact_measurement ?? ''} rows={2} /></Field>
          <Field label="التوصيات"><TextArea name="recommendations" defaultValue={initiative.recommendations ?? ''} rows={2} /></Field>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-navy-700">المؤشرات المرتبطة (يمكن اختيار أكثر من واحد)</label>
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

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">الصور والفيديوهات والملفات</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {(initiativeMedia as any[] | null)?.map((im) => (
            <div key={im.media_file.id} className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1.5 text-sm">
              {im.media_file.file_name}
              <form action={removeInitiativeMediaAction}>
                <input type="hidden" name="initiative_id" value={initiative.id} />
                <input type="hidden" name="media_file_id" value={im.media_file.id} />
                <button type="submit" className="text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
              </form>
            </div>
          ))}
        </div>
        <form action={attachInitiativeMediaAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="initiative_id" value={initiative.id} />
          <select name="media_file_id" required className="flex-1 rounded-xl border border-sky-200 px-4 py-2.5 text-sm">
            <option value="">— اختاري ملفًا مرفوعًا —</option>
            {(mediaFiles as MediaFile[] | null)?.map((m) => <option key={m.id} value={m.id}>{m.file_name}</option>)}
          </select>
          <SubmitButton>إرفاق</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">الروابط</h2>
        <div className="mb-4 space-y-2">
          {(initiativeLinks as any[] | null)?.map((link) => (
            <div key={link.id} className="flex items-center justify-between rounded-xl border border-sky-100 p-3">
              <a href={link.url} target="_blank" className="flex items-center gap-2 font-semibold text-sky-700">{link.title} <ExternalLink className="h-3.5 w-3.5" /></a>
              <form action={deleteInitiativeLinkAction}>
                <input type="hidden" name="id" value={link.id} />
                <input type="hidden" name="initiative_id" value={initiative.id} />
                <button type="submit" className="text-rose-500"><Trash2 className="h-4 w-4" /></button>
              </form>
            </div>
          ))}
        </div>
        <form action={addInitiativeLinkAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="initiative_id" value={initiative.id} />
          <TextInput name="title" required placeholder="عنوان الرابط" className="flex-1" />
          <TextInput name="url" required placeholder="https://..." dir="ltr" className="flex-1" />
          <SubmitButton>إضافة</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
