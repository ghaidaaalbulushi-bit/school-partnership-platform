import { FolderTree, Sparkles, FileCheck2, FileText, ImageIcon, Bot } from 'lucide-react';
import { getPlatformStats } from '@/lib/data/stats';
import { getSiteSettings } from '@/lib/data/site';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default async function AdminOverviewPage() {
  const [stats, settings] = await Promise.all([getPlatformStats(), getSiteSettings()]);

  const cards = [
    { label: 'المؤشرات', value: stats.indicatorsCount, icon: FolderTree, href: '/admin/indicators', color: 'sky' },
    { label: 'المبادرات', value: stats.initiativesCount, icon: Sparkles, href: '/admin/initiatives', color: 'rose' },
    { label: 'الملفات والشواهد', value: stats.evidenceCount, icon: FileCheck2, href: '/admin/media', color: 'mint' },
    { label: 'التقارير', value: stats.reportsCount, icon: FileText, href: '/admin/reports', color: 'gold' },
    { label: 'إجمالي الملفات المرفوعة', value: stats.mediaFilesCount, icon: ImageIcon, href: '/admin/media', color: 'sky' },
    { label: 'تحليلات ذكاء اصطناعي بانتظار المراجعة', value: stats.aiAnalysesPending, icon: Bot, href: '/admin/ai', color: 'peach' },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">نظرة عامة</h1>
      <p className="mb-8 text-sm text-navy-500">{settings.school_name} — {settings.platform_name}</p>

      {!settings.ai_enabled && (
        <Card className="mb-6 border-gold-300 bg-gold-100/40">
          <p className="text-sm font-semibold text-navy-700">
            ميزات الذكاء الاصطناعي غير مفعّلة حاليًا. أضيفي مفتاح <code dir="ltr">ANTHROPIC_API_KEY</code> إلى متغيرات
            بيئة Netlify ثم فعّليها من{' '}
            <Link href="/admin/settings" className="font-bold text-sky-600 underline">إعدادات الموقع</Link>.
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card className="transition hover:shadow-card-hover">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-xl bg-sky-50 p-2.5 text-sky-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-3xl font-extrabold text-navy-800">{c.value}</span>
                </div>
                <p className="text-sm font-semibold text-navy-600">{c.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
