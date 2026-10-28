import { Eye, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { SiteSettings } from '@/types/database';

export function VisionMissionSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-sky-50 to-white">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <Eye className="h-6 w-6" />
          </div>
          <h2 className="mb-3 text-xl font-extrabold text-navy-800">رؤية المدرسة</h2>
          <p className="leading-relaxed text-navy-700/85">{settings.vision_text}</p>
        </Card>

        <Card className="bg-gradient-to-br from-mint-50 to-white">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-mint-600">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="mb-3 text-xl font-extrabold text-navy-800">رسالة المدرسة</h2>
          <p className="leading-relaxed text-navy-700/85">{settings.mission_text}</p>
        </Card>
      </div>
    </section>
  );
}
