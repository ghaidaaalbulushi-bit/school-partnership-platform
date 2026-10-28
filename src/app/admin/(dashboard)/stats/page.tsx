import { FolderTree, Sparkles, CalendarDays, FileCheck2, FileText, ImageIcon, Building2 } from 'lucide-react';
import { getPlatformStats } from '@/lib/data/stats';
import { Card } from '@/components/ui/Card';

export default async function AdminStatsPage() {
  const stats = await getPlatformStats();

  const cards = [
    { label: 'عدد المؤشرات', value: stats.indicatorsCount, icon: FolderTree },
    { label: 'عدد المبادرات', value: stats.initiativesCount, icon: Sparkles },
    { label: 'عدد الفعاليات (بتاريخ محدد)', value: stats.eventsCount, icon: CalendarDays },
    { label: 'عدد الملفات والشواهد', value: stats.evidenceCount, icon: FileCheck2 },
    { label: 'عدد التقارير', value: stats.reportsCount, icon: FileText },
    { label: 'إجمالي الملفات المرفوعة', value: stats.mediaFilesCount, icon: ImageIcon },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">الإحصائيات</h1>
      <p className="mb-6 text-sm text-navy-500">أرقام فعلية مباشرة من قاعدة البيانات — لا توجد بيانات تقديرية.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><Icon className="h-5 w-5" /></span>
                <span className="text-3xl font-extrabold text-navy-800">{c.value}</span>
              </div>
              <p className="text-sm font-semibold text-navy-600">{c.label}</p>
            </Card>
          );
        })}

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-xl bg-sky-50 p-2.5 text-sky-600"><Building2 className="h-5 w-5" /></span>
            <span className="text-3xl font-extrabold text-navy-800">{stats.participatingPartiesCount ?? '—'}</span>
          </div>
          <p className="text-sm font-semibold text-navy-600">عدد الجهات المشاركة (عند توفر البيانات)</p>
        </Card>
      </div>
    </div>
  );
}
