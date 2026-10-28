import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getIndicatorById, getSectionTree, getPublishedIndicators } from '@/lib/data/indicators';
import { SectionCard } from '@/components/SectionCard';
import { HeroBackground } from '@/components/decor/HeroBackground';

export const revalidate = 60;

export default async function IndicatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [indicator, sections, allIndicators] = await Promise.all([
    getIndicatorById(id),
    getSectionTree(id),
    getPublishedIndicators(),
  ]);

  if (!indicator) notFound();

  const currentIndex = allIndicators.findIndex((i) => i.id === id);
  const prevIndicator = currentIndex > 0 ? allIndicators[currentIndex - 1] : null;
  const nextIndicator = currentIndex < allIndicators.length - 1 ? allIndicators[currentIndex + 1] : null;

  return (
    <div>
      <div className="relative overflow-hidden px-4 py-14 md:px-8">
        <HeroBackground />
        <div className="relative mx-auto max-w-5xl">
          {indicator.code && (
            <span className="mb-3 inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-sky-600 shadow-soft">
              المؤشر {indicator.code}
            </span>
          )}
          <h1 className="mb-2 text-xl font-bold text-navy-600/80">{indicator.standard_name}</h1>
          <h2 className="mb-4 text-2xl font-extrabold text-navy-800 md:text-4xl">{indicator.title}</h2>
          <p className="max-w-3xl leading-relaxed text-navy-700/85">{indicator.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
        <h3 className="mb-5 text-lg font-extrabold text-navy-800">الأقسام والشواهد</h3>

        {sections.length === 0 ? (
          <p className="text-navy-600/70">لم تتم إضافة أقسام لهذا المؤشر بعد.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((section) => (
              <SectionCard key={section.id} section={section} href={`/indicators/${id}/sections/${section.id}`} />
            ))}
          </div>
        )}

        <div className="mt-12 flex items-center justify-between gap-4 border-t border-sky-100 pt-6">
          {prevIndicator ? (
            <Link href={`/indicators/${prevIndicator.id}`} className="flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-sky-600">
              <ChevronRight className="h-4 w-4" />
              <span>
                <span className="block text-xs text-navy-400">المؤشر السابق</span>
                {prevIndicator.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {nextIndicator ? (
            <Link href={`/indicators/${nextIndicator.id}`} className="flex items-center gap-2 text-end text-sm font-bold text-navy-700 hover:text-sky-600">
              <span>
                <span className="block text-xs text-navy-400">المؤشر التالي</span>
                {nextIndicator.title}
              </span>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
