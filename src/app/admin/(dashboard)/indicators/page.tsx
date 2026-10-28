import Link from 'next/link';
import { ArrowUp, ArrowDown, Trash2, FolderOpen } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import {
  createIndicatorAction,
  togglePublishIndicatorAction,
  deleteIndicatorAction,
  reorderIndicatorAction,
} from './actions';
import type { Indicator } from '@/types/database';

export default async function AdminIndicatorsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('indicators').select('*').order('sort_order');
  const indicators = (data as Indicator[]) ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">المؤشرات والمعايير</h1>
      <p className="mb-6 text-sm text-navy-500">
        المؤشرات الثلاثة الأساسية للمنصة. يمكن إضافة مؤشرات أخرى مستقبلًا بنفس الطريقة.
      </p>

      <div className="mb-8 space-y-3">
        {indicators.map((indicator, i) => (
          <Card key={indicator.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  {indicator.code && (
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700">{indicator.code}</span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      indicator.status === 'published' ? 'bg-mint-100 text-mint-700' : 'bg-gold-100 text-gold-500'
                    }`}
                  >
                    {indicator.status === 'published' ? 'منشور' : 'مسودة'}
                  </span>
                </div>
                <h3 className="font-extrabold text-navy-800">{indicator.title}</h3>
                <p className="line-clamp-2 text-sm text-navy-600/80">{indicator.description}</p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <form action={reorderIndicatorAction}>
                  <input type="hidden" name="id" value={indicator.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} className="rounded-lg p-2 text-navy-400 hover:bg-sky-50 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={reorderIndicatorAction}>
                  <input type="hidden" name="id" value={indicator.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={i === indicators.length - 1} className="rounded-lg p-2 text-navy-400 hover:bg-sky-50 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </form>
                <Link href={`/admin/indicators/${indicator.id}`} className="rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-700 hover:bg-sky-100">
                  تعديل
                </Link>
                <Link href={`/admin/indicators/${indicator.id}/sections`} className="flex items-center gap-1 rounded-lg bg-mint-100 px-3 py-1.5 text-sm font-bold text-mint-700 hover:bg-mint-200">
                  <FolderOpen className="h-3.5 w-3.5" /> الأقسام
                </Link>
                <form action={togglePublishIndicatorAction}>
                  <input type="hidden" name="id" value={indicator.id} />
                  <input type="hidden" name="status" value={indicator.status} />
                  <button type="submit" className="rounded-lg bg-navy-50 px-3 py-1.5 text-sm font-bold text-navy-700 hover:bg-navy-100">
                    {indicator.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                  </button>
                </form>
                <form action={deleteIndicatorAction}>
                  <input type="hidden" name="id" value={indicator.id} />
                  <button type="submit" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">إضافة مؤشر جديد</h2>
        <form action={createIndicatorAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput name="code" placeholder="رقم المؤشر (اختياري)" />
            <TextInput name="standard_name" placeholder="اسم المعيار" className="sm:col-span-2" />
          </div>
          <TextInput name="title" required placeholder="عنوان المؤشر" />
          <TextArea name="description" required placeholder="وصف المؤشر" />
          <SubmitButton>إضافة المؤشر</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
