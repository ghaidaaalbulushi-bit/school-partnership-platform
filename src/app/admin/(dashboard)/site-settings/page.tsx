import { getSiteSettings } from '@/lib/data/site';
import { SiteSettingsForm } from './SiteSettingsForm';

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">بيانات المدرسة والصفحة الرئيسية</h1>
      <p className="mb-6 text-sm text-navy-500">هذه الحقول تظهر مباشرة في الصفحة الرئيسية للموقع العام.</p>
      <SiteSettingsForm settings={settings} />
    </div>
  );
}
