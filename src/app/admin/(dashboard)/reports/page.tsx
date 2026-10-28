import Link from 'next/link';
import { Sparkles, Trash2 } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { TextInput, SubmitButton } from '@/components/admin/forms';
import { createManualReportAction, togglePublishReportAction, deleteReportAction } from './actions';
import { formatArabicDate } from '@/lib/utils';
import type { ReportRow } from '@/types/database';

export default async function AdminReportsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
  const reports = (data as ReportRow[]) ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">التقارير</h1>
      <p className="mb-6 text-sm text-navy-500">
        تقارير توثيقية يدوية أو مُنشأة بالذكاء الاصطناعي من بيانات المبادرات (من صفحة تعديل كل مبادرة).
      </p>

      <div className="mb-8 space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${report.status === 'published' ? 'bg-mint-100 text-mint-700' : 'bg-gold-100 text-gold-500'}`}>
                  {report.status === 'published' ? 'منشور' : 'مسودة'}
                </span>
                {report.generated_by_ai && (
                  <span className="flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">
                    <Sparkles className="h-3 w-3" /> بمساعدة الذكاء الاصطناعي
                  </span>
                )}
                <span className="text-xs text-navy-500">{formatArabicDate(report.created_at)}</span>
              </div>
              <p className="font-extrabold text-navy-800">{report.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`/admin/reports/${report.id}`} className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-700 hover:bg-sky-100">
                فتح
              </Link>
              <form action={togglePublishReportAction}>
                <input type="hidden" name="id" value={report.id} />
                <input type="hidden" name="status" value={report.status} />
                <button type="submit" className="rounded-lg bg-navy-50 px-3 py-1.5 text-sm font-bold text-navy-700 hover:bg-navy-100">
                  {report.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                </button>
              </form>
              <form action={deleteReportAction}>
                <input type="hidden" name="id" value={report.id} />
                <button type="submit" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </Card>
        ))}
        {reports.length === 0 && <p className="text-navy-500">لا توجد تقارير بعد.</p>}
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">إنشاء تقرير يدوي جديد</h2>
        <form action={createManualReportAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextInput name="title" required placeholder="عنوان التقرير" className="flex-1" />
          <SubmitButton>إنشاء</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
