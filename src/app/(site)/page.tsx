import { getSiteSettings, getThemeSettings } from '@/lib/data/site';
import { getPublishedIndicators } from '@/lib/data/indicators';
import { getPublishedInitiatives } from '@/lib/data/initiatives';
import { getVisibleAdminRoles } from '@/lib/data/admin-roles';
import { HeroSection } from '@/components/home/HeroSection';
import { VisionMissionSection } from '@/components/home/VisionMissionSection';
import { AdministrationSection } from '@/components/home/AdministrationSection';
import { IndicatorsSection } from '@/components/home/IndicatorsSection';
import { InitiativesPreviewSection } from '@/components/home/InitiativesPreviewSection';
import { CtaSection } from '@/components/home/CtaSection';
import { SectionDivider } from '@/components/decor/SectionDivider';

export const revalidate = 60; // ISR: home page content refreshes at most once a minute

export default async function HomePage() {
  const [settings, theme, indicators, initiatives, adminRoles] = await Promise.all([
    getSiteSettings(),
    getThemeSettings(),
    getPublishedIndicators(),
    getPublishedInitiatives({ limit: 3 }),
    getVisibleAdminRoles(),
  ]);

  const visibility = theme.home_sections_visibility;

  const sectionMap: Record<string, React.ReactNode> = {
    hero: <HeroSection settings={settings} />,
    vision_mission: visibility.vision_mission !== false && <VisionMissionSection settings={settings} />,
    administration: visibility.administration !== false && <AdministrationSection roles={adminRoles} />,
    indicators: visibility.indicators !== false && <IndicatorsSection indicators={indicators} />,
    initiatives_preview:
      visibility.initiatives_preview !== false && <InitiativesPreviewSection initiatives={initiatives} />,
    cta: visibility.cta !== false && <CtaSection />,
  };

  const order = theme.home_sections_order?.length ? theme.home_sections_order : Object.keys(sectionMap);

  return (
    <>
      {order.map((key, i) => {
        const visible = visibility[key] !== false;
        if (!visible || !sectionMap[key]) return null;
        return (
          <div key={key}>
            {sectionMap[key]}
            {i < order.length - 1 && <SectionDivider />}
          </div>
        );
      })}
    </>
  );
}
