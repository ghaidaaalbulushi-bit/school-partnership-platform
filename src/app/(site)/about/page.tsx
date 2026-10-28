import { getSiteSettings } from '@/lib/data/site';
import { getVisibleAdminRoles } from '@/lib/data/admin-roles';
import { VisionMissionSection } from '@/components/home/VisionMissionSection';
import { AdministrationSection } from '@/components/home/AdministrationSection';

export const revalidate = 60;

export default async function AboutPage() {
  const [settings, roles] = await Promise.all([getSiteSettings(), getVisibleAdminRoles()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-navy-800">عن الشراكة</h1>
        <p className="mx-auto max-w-2xl text-navy-700/70">
          منصة توثيق الشراكة المدرسية لمدرسة أسماء بنت النعمان (1-8)، تجمع مؤشرات الشراكة المجتمعية ومبادراتها وشواهدها في مكان واحد
        </p>
      </div>
      <VisionMissionSection settings={settings} />
      <AdministrationSection roles={roles} />
    </div>
  );
}
