import { getPublishedIndicators } from '@/lib/data/indicators';
import { IndicatorCard } from '@/components/IndicatorCard';

export const revalidate = 60;

export default async function IndicatorsListPage() {
  const indicators = await getPublishedIndicators();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-navy-800">المؤشرات والمعايير</h1>
        <p className="mx-auto max-w-2xl text-navy-700/70">
          مؤشرات معيار الشراكة المجتمعية الموثّقة في هذه المنصة
        </p>
      </div>

      {indicators.length === 0 ? (
        <p className="text-center text-navy-600/70">لم تتم إضافة مؤشرات بعد.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {indicators.map((indicator) => (
            <IndicatorCard key={indicator.id} indicator={indicator} />
          ))}
        </div>
      )}
    </div>
  );
}
