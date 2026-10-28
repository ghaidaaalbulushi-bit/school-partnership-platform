import { SchoolLogo } from '@/components/SchoolLogo';
import type { SiteSettings } from '@/types/database';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-sky-100 bg-navy-800 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-8">
        <div className="flex items-start gap-3">
          <SchoolLogo src={settings.logo_storage_path} size={44} className="rounded-xl bg-white p-1" />
          <div>
            <p className="font-bold">{settings.school_name}</p>
            <p className="text-sm text-cream-100/70">{settings.platform_name}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {settings.contact_email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-300" /> {settings.contact_email}
            </p>
          )}
          {settings.contact_phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky-300" /> {settings.contact_phone}
            </p>
          )}
          {settings.contact_address && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-300" /> {settings.contact_address}
            </p>
          )}
        </div>

        <div className="text-sm text-cream-100/70 md:text-end">
          {settings.footer_text || `© ${new Date().getFullYear()} ${settings.school_name} — جميع الحقوق محفوظة`}
        </div>
      </div>
    </footer>
  );
}
