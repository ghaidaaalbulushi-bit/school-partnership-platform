import { getSiteSettings } from '@/lib/data/site';
import { Card } from '@/components/ui/Card';
import { SubmitButton } from '@/components/admin/forms';
import { SchoolLogo } from '@/components/SchoolLogo';
import { updateToggleSettingsAction, uploadLogoAction } from './actions';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-extrabold text-navy-800">إعدادات الموقع</h1>
        <p className="text-sm text-navy-500">إعدادات عامة على مستوى المنصة.</p>
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">شعار المدرسة</h2>
        <div className="mb-4 flex items-center gap-4">
          <SchoolLogo src={settings.logo_storage_path} size={72} className="rounded-xl border border-sky-100" />
          <p className="text-sm text-navy-500">
            {settings.logo_storage_path ? 'الشعار المخصص الحالي' : 'يُستخدم حاليًا الشعار الأصلي المرفق مع المشروع'}
          </p>
        </div>
        <form action={uploadLogoAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="file"
            name="logo"
            accept="image/png,image/jpeg,image/webp"
            required
            className="flex-1 rounded-xl border border-sky-200 px-4 py-2 text-sm"
          />
          <SubmitButton>رفع واستبدال الشعار</SubmitButton>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">الوظائف والصلاحيات</h2>
        <form action={updateToggleSettingsAction} className="space-y-4">
          <label className="flex items-start gap-3 rounded-xl border border-sky-100 p-4">
            <input type="checkbox" name="ai_enabled" defaultChecked={settings.ai_enabled} className="mt-1" />
            <span>
              <span className="block font-bold text-navy-700">تفعيل ميزات الذكاء الاصطناعي</span>
              <span className="block text-xs text-navy-500">
                تتطلب وجود <code dir="ltr">ANTHROPIC_API_KEY</code> صالح في متغيرات بيئة Netlify. إن لم يُفعَّل، تستمر بقية المنصة بالعمل عادةً.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-sky-100 p-4">
            <input type="checkbox" name="file_download_enabled" defaultChecked={settings.file_download_enabled} className="mt-1" />
            <span>
              <span className="block font-bold text-navy-700">السماح بتحميل الملفات افتراضيًا</span>
              <span className="block text-xs text-navy-500">يمكن تخصيص هذا الإعداد لكل شاهد على حدة من صفحة إدارة القسم.</span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-sky-100 p-4">
            <input type="checkbox" name="file_print_enabled" defaultChecked={settings.file_print_enabled} className="mt-1" />
            <span>
              <span className="block font-bold text-navy-700">السماح بطباعة الملفات افتراضيًا</span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-sky-100 p-4">
            <input type="checkbox" name="presentation_mode_enabled" defaultChecked={settings.presentation_mode_enabled} className="mt-1" />
            <span>
              <span className="block font-bold text-navy-700">تفعيل وضع العرض أمام لجنة التقييم</span>
            </span>
          </label>

          <SubmitButton>حفظ</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
