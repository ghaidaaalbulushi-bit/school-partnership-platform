import { IndicatorCard } from '@/components/IndicatorCard';
import type { Indicator } from '@/types/database';

export function IndicatorsSection({ indicators }: { indicators: Indicator[] }) {
  return (
    <section id="indicators" className="relative bg-gradient-to-b from-cream-100/60 to-transparent px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-extrabold text-navy-800 md:text-3xl">المؤشرات والمعايير</h2>
          <p className="mx-auto max-w-2xl text-navy-700/70">
            اختاري أحد المؤشرات الثلاثة لاستعراض الأقسام والشواهد الموثّقة له
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
    </section>
  );
}
