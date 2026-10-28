import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Field, TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import { updateIndicatorAction } from '../actions';
import type { Indicator } from '@/types/database';

export default async function AdminIndicatorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('indicators').select('*').eq('id', id).single();
  const indicator = data as Indicator | null;
  if (!indicator) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold text-navy-800">تعديل المؤشر</h1>
      <Card>
        <form action={updateIndicatorAction} className="space-y-4">
          <input type="hidden" name="id" value={indicator.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="رقم المؤشر (اختياري)">
              <TextInput name="code" defaultValue={indicator.code ?? ''} />
            </Field>
            <Field label="اسم المعيار">
              <TextInput name="standard_name" defaultValue={indicator.standard_name} />
            </Field>
          </div>
          <Field label="عنوان المؤشر">
            <TextInput name="title" defaultValue={indicator.title} required />
          </Field>
          <Field label="الوصف">
            <TextArea name="description" defaultValue={indicator.description} rows={5} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="أيقونة (اسم من Lucide Icons)" hint="مثال: Users, GraduationCap, Building2">
              <TextInput name="icon" defaultValue={indicator.icon ?? 'Users'} dir="ltr" />
            </Field>
            <Field label="لون البطاقة">
              <select name="color_theme" defaultValue={indicator.color_theme ?? 'sky'} className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm">
                <option value="sky">أزرق سماوي</option>
                <option value="mint">أخضر نعناعي</option>
                <option value="peach">خوخي</option>
              </select>
            </Field>
          </div>
          <SubmitButton>حفظ التغييرات</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
