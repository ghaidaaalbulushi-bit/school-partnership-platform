import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/data/site';
import { Card } from '@/components/ui/Card';
import { TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import {
  createNavItemAction,
  updateNavItemAction,
  toggleNavVisibilityAction,
  deleteNavItemAction,
  updateFooterTextAction,
} from './actions';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import type { NavItem } from '@/types/database';

export default async function AdminNavPage() {
  const supabase = await createServerSupabaseClient();
  const [{ data }, settings] = await Promise.all([
    supabase.from('nav_items').select('*').order('sort_order'),
    getSiteSettings(),
  ]);
  const navItems = (data as NavItem[]) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-extrabold text-navy-800">عناصر القائمة والتذييل</h1>
        <p className="mb-6 text-sm text-navy-500">تحكّمي بعناصر القائمة الرئيسية وبيانات التذييل.</p>

        <div className="mb-6 space-y-3">
          {navItems.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form action={updateNavItemAction} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input type="hidden" name="id" value={item.id} />
                <TextInput name="label" defaultValue={item.label} className="sm:max-w-[180px]" />
                <TextInput name="href" defaultValue={item.href} dir="ltr" className="sm:max-w-[180px]" />
                <SubmitButton>حفظ</SubmitButton>
              </form>
              <div className="flex items-center gap-2">
                <form action={toggleNavVisibilityAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="is_visible" value={String(item.is_visible)} />
                  <button type="submit" className="rounded-lg p-2 text-navy-500 hover:bg-sky-50">
                    {item.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </form>
                <form action={deleteNavItemAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="mb-4 font-bold text-navy-800">إضافة عنصر قائمة جديد</h2>
          <form action={createNavItemAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextInput name="label" required placeholder="العنوان" className="flex-1" />
            <TextInput name="href" required placeholder="/path" dir="ltr" className="flex-1" />
            <SubmitButton>إضافة</SubmitButton>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">بيانات التذييل والتواصل</h2>
        <form action={updateFooterTextAction} className="space-y-4">
          <TextInput name="contact_email" defaultValue={settings.contact_email ?? ''} placeholder="البريد الإلكتروني" dir="ltr" />
          <TextInput name="contact_phone" defaultValue={settings.contact_phone ?? ''} placeholder="رقم الهاتف" dir="ltr" />
          <TextInput name="contact_address" defaultValue={settings.contact_address ?? ''} placeholder="العنوان" />
          <TextArea name="footer_text" defaultValue={settings.footer_text ?? ''} placeholder="نص التذييل" />
          <SubmitButton>حفظ</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
