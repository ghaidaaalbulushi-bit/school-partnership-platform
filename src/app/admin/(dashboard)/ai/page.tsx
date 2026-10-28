import { Bot, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/data/site';
import { Card } from '@/components/ui/Card';
import { TextInput, SubmitButton } from '@/components/admin/forms';
import { approveAnalysisAction, dismissAnalysisAction } from './actions';
import type { AiAnalysis, Indicator, SectionRow, MediaFile } from '@/types/database';

const STATUS_BADGE: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: 'بانتظار المعالجة', className: 'bg-gold-100 text-gold-500', icon: Loader2 },
  processing: { label: 'جارٍ التحليل...', className: 'bg-sky-100 text-sky-600', icon: Loader2 },
  completed: { label: 'مكتمل', className: 'bg-mint-100 text-mint-700', icon: CheckCircle2 },
  failed: { label: 'فشل التحليل', className: 'bg-rose-100 text-rose-600', icon: XCircle },
};

export default async function AdminAiPage() {
  const supabase = await createServerSupabaseClient();
  const settings = await getSiteSettings();

  const [{ data: analyses }, { data: indicators }, { data: sections }, { data: mediaFiles }] = await Promise.all([
    supabase.from('ai_analyses').select('*').order('created_at', { ascending: false }),
    supabase.from('indicators').select('*').order('sort_order'),
    supabase.from('sections').select('*').order('sort_order'),
    supabase.from('media_files').select('*'),
  ]);

  const mediaMap = new Map(((mediaFiles as MediaFile[]) ?? []).map((m) => [m.id, m]));
  const indicatorMap = new Map(((indicators as Indicator[]) ?? []).map((i) => [i.id, i]));
  const sectionsList = (sections as SectionRow[]) ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-extrabold text-navy-800">
        <Bot className="h-6 w-6 text-sky-500" /> المساعد الذكي — تحليل المستندات
      </h1>
      <p className="mb-6 text-sm text-navy-500">
        نتائج تحليل ملفات PDF بالذكاء الاصطناعي. لا يُعتمد أي تصنيف أو يُنشر إلا بعد موافقتك.
      </p>

      {!settings.ai_enabled && (
        <Card className="mb-6 border-gold-300 bg-gold-100/40">
          <p className="flex items-start gap-2 text-sm font-semibold text-navy-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
            خدمة الذكاء الاصطناعي غير مفعّلة. أضيفي <code dir="ltr">ANTHROPIC_API_KEY</code> في Netlify وفعّليها من إعدادات الموقع.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {(analyses as AiAnalysis[] | null)?.length ? (
          (analyses as AiAnalysis[]).map((a) => {
            const badge = STATUS_BADGE[a.status]!;
            const Icon = badge.icon;
            const file = mediaMap.get(a.media_file_id);
            const suggestedSections = sectionsList.filter((s) => a.suggested_indicator_ids?.includes(s.indicator_id));

            return (
              <Card key={a.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-navy-800">{file?.file_name ?? 'ملف محذوف'}</p>
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>
                    <Icon className={`h-3.5 w-3.5 ${a.status === 'processing' || a.status === 'pending' ? 'animate-spin' : ''}`} />
                    {badge.label}
                  </span>
                </div>

                {a.status === 'failed' && <p className="text-sm text-rose-600">{a.error_message}</p>}

                {a.status === 'completed' && !a.approved && (
                  <div className="space-y-3">
                    <p className="text-sm text-navy-500"><strong>نوع المستند:</strong> {a.document_type}</p>
                    <p className="text-sm text-navy-700">{a.summary}</p>
                    <p className="rounded-lg bg-sky-50 p-3 text-xs text-navy-600"><strong>سبب التصنيف:</strong> {a.classification_reasoning}</p>
                    {a.possible_duplicate_of && (
                      <p className="flex items-center gap-1.5 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                        <AlertTriangle className="h-4 w-4" /> يُحتمل أن هذا الملف مكرر لملف سبق تحليله — راجعيه قبل الاعتماد.
                      </p>
                    )}

                    <form action={approveAnalysisAction} className="space-y-3 rounded-xl border border-sky-100 p-4">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="media_file_id" value={a.media_file_id} />
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-navy-700">المؤشرات (يمكن تعديل اقتراح الذكاء الاصطناعي)</label>
                        <div className="flex flex-wrap gap-2">
                          {[...indicatorMap.values()].map((ind) => (
                            <label key={ind.id} className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs">
                              <input type="checkbox" name="indicator_ids" value={ind.id} defaultChecked={a.suggested_indicator_ids?.includes(ind.id)} />
                              {ind.title}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold text-navy-700">القسم</label>
                        <select name="section_id" defaultValue={a.suggested_section_id ?? ''} className="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm">
                          <option value="">— بدون ربط بقسم —</option>
                          {suggestedSections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                          {sectionsList
                            .filter((s) => !suggestedSections.includes(s))
                            .map((s) => <option key={s.id} value={s.id}>{s.title} (غير مقترح)</option>)}
                        </select>
                      </div>
                      <TextInput name="title" placeholder="عنوان الشاهد (اختياري)" defaultValue={a.document_type ?? ''} />
                      <div className="flex items-center gap-2">
                        <SubmitButton>اعتماد ونشر كشاهد</SubmitButton>
                        <form action={dismissAnalysisAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100">
                            تجاهل
                          </button>
                        </form>
                      </div>
                    </form>
                  </div>
                )}

                {a.approved && <p className="text-sm font-semibold text-mint-700">✓ تم الاعتماد ونشره كشاهد.</p>}
              </Card>
            );
          })
        ) : (
          <p className="text-navy-500">لا توجد تحليلات بعد. ابدئي من صفحة إدارة الملفات بالضغط على "تحليل المستند بالذكاء الاصطناعي".</p>
        )}
      </div>
    </div>
  );
}
