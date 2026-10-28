import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { TextInput, SubmitButton } from '@/components/admin/forms';
import { createRoleAction, updateRoleAction, toggleRoleVisibilityAction, deleteRoleAction } from './actions';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { AdminRole } from '@/types/database';

export default async function AdminAdministrationPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('admin_roles').select('*').order('sort_order');
  const roles = (data as AdminRole[]) ?? [];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">الإدارة المدرسية</h1>
      <p className="mb-6 text-sm text-navy-500">
        بطاقات نصية فقط — بدون صور شخصية، بحسب شرط المشروع. يمكن إضافة مناصب أخرى أو إخفاؤها.
      </p>

      <div className="mb-8 space-y-3">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form action={updateRoleAction} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="id" value={role.id} />
              <TextInput name="full_name" defaultValue={role.full_name} className="sm:max-w-[220px]" />
              <TextInput name="job_title" defaultValue={role.job_title} className="sm:max-w-[220px]" />
              <SubmitButton>حفظ</SubmitButton>
            </form>
            <div className="flex items-center gap-2">
              <form action={toggleRoleVisibilityAction}>
                <input type="hidden" name="id" value={role.id} />
                <input type="hidden" name="is_visible" value={String(role.is_visible)} />
                <button type="submit" className="rounded-lg p-2 text-navy-500 hover:bg-sky-50" title={role.is_visible ? 'إخفاء' : 'إظهار'}>
                  {role.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </form>
              <form action={deleteRoleAction}>
                <input type="hidden" name="id" value={role.id} />
                <button type="submit" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" title="حذف">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">إضافة منصب جديد</h2>
        <form action={createRoleAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-bold text-navy-700">الاسم الكامل</label>
            <TextInput name="full_name" required placeholder="أ. ..." />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-bold text-navy-700">المسمى الوظيفي</label>
            <TextInput name="job_title" required placeholder="مثال: منسقة الأنشطة" />
          </div>
          <SubmitButton>إضافة</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
