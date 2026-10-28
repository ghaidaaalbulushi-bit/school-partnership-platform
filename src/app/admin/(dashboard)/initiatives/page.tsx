import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { TextInput, SubmitButton } from '@/components/admin/forms';
import { createInitiativeAction, togglePublishInitiativeAction, deleteInitiativeAction } from './actions';
import { Trash2 } from 'lucide-react';
import { formatArabicDate } from '@/lib/utils';
import type { Initiative } from '@/types/database';

export default async function AdminInitiativesPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('initiatives').select('*').order('created_at', { ascending: false });
  const initiatives = (data as Initiative[]) ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">المبادرات والفعاليات</h1>
      <p className="mb-6 text-sm text-navy-500">أضيفي مبادرة ثم اضغطي "تعديل" لإكمال بقية التفاصيل والصور والروابط.</p>

      <div className="mb-8 space-y-3">
        {initiatives.map((initiative) => (
          <Card key={initiative.id} className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${initiative.status === 'published' ? 'bg-mint-100 text-mint-700' : 'bg-gold-100 text-gold-500'}`}>
                  {initiative.status === 'published' ? 'منشور' : 'مسودة'}
                </span>
                {initiative.execution_date && <span className="text-xs text-navy-500">{formatArabicDate(initiative.execution_date)}</span>}
              </div>
              <p className="font-extrabold text-navy-800">{initiative.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`/admin/initiatives/${initiative.id}`} className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-700 hover:bg-sky-100">
                تعديل
              </Link>
              <form action={togglePublishInitiativeAction}>
                <input type="hidden" name="id" value={initiative.id} />
                <input type="hidden" name="status" value={initiative.status} />
                <button type="submit" className="rounded-lg bg-navy-50 px-3 py-1.5 text-sm font-bold text-navy-700 hover:bg-navy-100">
                  {initiative.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                </button>
              </form>
              <form action={deleteInitiativeAction}>
                <input type="hidden" name="id" value={initiative.id} />
                <button type="submit" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">إضافة مبادرة جديدة</h2>
        <form action={createInitiativeAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextInput name="title" required placeholder="اسم المبادرة" className="flex-1" />
          <TextInput name="execution_date" type="date" className="sm:max-w-[180px]" />
          <SubmitButton>إضافة</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
