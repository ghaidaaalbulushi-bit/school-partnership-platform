import { Mail, Phone, MapPin } from 'lucide-react';
import { getSiteSettings } from '@/lib/data/site';
import { Card } from '@/components/ui/Card';

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-navy-800">تواصل معنا</h1>
        <p className="text-navy-700/70">{settings.school_name}</p>
      </div>

      <Card className="space-y-4">
        {settings.contact_email && (
          <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50">
            <Mail className="h-5 w-5 text-sky-500" />
            <span className="font-semibold text-navy-700">{settings.contact_email}</span>
          </a>
        )}
        {settings.contact_phone && (
          <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-sky-50">
            <Phone className="h-5 w-5 text-sky-500" />
            <span className="font-semibold text-navy-700">{settings.contact_phone}</span>
          </a>
        )}
        {settings.contact_address && (
          <div className="flex items-center gap-3 rounded-xl p-3">
            <MapPin className="h-5 w-5 text-sky-500" />
            <span className="font-semibold text-navy-700">{settings.contact_address}</span>
          </div>
        )}
        {!settings.contact_email && !settings.contact_phone && !settings.contact_address && (
          <p className="text-center text-navy-500">لم تُضف بيانات تواصل بعد. يمكن إضافتها من لوحة الإدارة → إعدادات الموقع.</p>
        )}
      </Card>
    </div>
  );
}
