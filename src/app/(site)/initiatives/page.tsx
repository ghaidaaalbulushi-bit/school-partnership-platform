import * as Icons from 'lucide-react';
import Link from 'next/link';
import { getPublishedInitiatives } from '@/lib/data/initiatives';
import { getPublishedIndicators } from '@/lib/data/indicators';
import { InteractiveCard } from '@/components/ui/Card';
import { formatArabicDate } from '@/lib/utils';

export const revalidate = 60;

export default async function InitiativesPage({
  searchParams,
}: {
  searchParams: Promise<{ indicator?: string }>;
}) {
  const { indicator: indicatorFilter } = await searchParams;
  const [initiatives, indicators] = await Promise.all([
    getPublishedInitiatives({ indicatorId: indicatorFilter }),
    getPublishedIndicators(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-navy-800">المبادرات والفعاليات</h1>
        <p className="mx-auto max-w-2xl text-navy-700/70">توثيق المبادرات والفعاليات والزيارات والاجتماعات</p>
      </div>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <Link
          href="/initiatives"
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${!indicatorFilter ? 'bg-navy-700 text-white' : 'bg-sky-50 text-navy-700 hover:bg-sky-100'}`}
        >
          الكل
        </Link>
        {indicators.map((ind) => (
          <Link
            key={ind.id}
            href={`/initiatives?indicator=${ind.id}`}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${indicatorFilter === ind.id ? 'bg-navy-700 text-white' : 'bg-sky-50 text-navy-700 hover:bg-sky-100'}`}
          >
            {ind.title}
          </Link>
        ))}
      </div>

      {initiatives.length === 0 ? (
        <p className="text-center text-navy-600/70">لا توجد مبادرات منشورة ضمن هذا التصنيف بعد.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {initiatives.map((initiative) => {
            const Icon = (Icons as any)[initiative.cover_icon ?? 'Sparkles'] ?? Icons.Sparkles;
            return (
              <Link key={initiative.id} href={`/initiatives/${initiative.id}`}>
                <InteractiveCard className="h-full bg-gradient-to-br from-rose-50 to-white">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1 font-extrabold text-navy-800">{initiative.title}</h3>
                  {initiative.execution_date && (
                    <p className="mb-3 text-xs font-semibold text-navy-500">
                      {formatArabicDate(initiative.execution_date)}
                    </p>
                  )}
                  {initiative.description && (
                    <p className="line-clamp-3 text-sm text-navy-700/75">{initiative.description}</p>
                  )}
                </InteractiveCard>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
