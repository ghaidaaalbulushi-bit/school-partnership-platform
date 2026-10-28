import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSiteSettings, getNavItems, getThemeSettings } from '@/lib/data/site';
import { themeToCssVars } from '@/lib/theme';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    return {
      title: `${settings.platform_name} | ${settings.school_name}`,
      description: settings.mission_text,
    };
  } catch {
    return { title: 'منصة توثيق الشراكة المدرسية' };
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, navItems, theme] = await Promise.all([getSiteSettings(), getNavItems(), getThemeSettings()]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeToCssVars(theme.colors) }} />
      <Header navItems={navItems} settings={settings} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
