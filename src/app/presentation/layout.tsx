import { getSiteSettings } from '@/lib/data/site';
import { SchoolLogo } from '@/components/SchoolLogo';
import Link from 'next/link';

/** Presentation mode has its own minimal chrome — no public nav, no footer,
 * no admin sidebar — just the logo and a quiet exit link, so a committee
 * member reviewing evidence on a large screen isn't distracted by anything
 * that isn't the evidence itself. */
export default async function PresentationLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  if (!settings.presentation_mode_enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900 p-8 text-center text-white">
        <p>وضع العرض أمام لجنة التقييم غير مفعّل حاليًا من إعدادات الموقع.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-navy-900 font-cairo text-cream-50">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <SchoolLogo src={settings.logo_storage_path} size={36} className="rounded-lg bg-white p-0.5" />
          <span className="text-sm font-bold">{settings.school_name} — وضع العرض أمام لجنة التقييم</span>
        </div>
        <Link href="/" className="text-xs text-cream-100/60 hover:text-cream-100">إنهاء وضع العرض</Link>
      </header>
      {children}
    </div>
  );
}
