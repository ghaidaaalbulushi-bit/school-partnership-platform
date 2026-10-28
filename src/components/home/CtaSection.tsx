import { ButtonLink } from '@/components/ui/Button';

export function CtaSection() {
  return (
    <section className="px-4 py-16 md:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 to-navy-800 px-6 py-14 text-center text-white">
        <svg aria-hidden className="absolute -end-10 -top-10 h-48 w-48 text-sky-400/20" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="50" />
        </svg>
        <svg aria-hidden className="absolute -start-6 -bottom-6 h-36 w-36 text-gold-400/20" viewBox="0 0 100 100" fill="currentColor">
          <rect width="100" height="100" rx="24" />
        </svg>

        <h2 className="relative mb-3 text-2xl font-extrabold md:text-3xl">معًا نوثّق شراكة فاعلة لمستقبل أبنائنا</h2>
        <p className="relative mx-auto mb-8 max-w-xl text-cream-100/85">
          استكشفي مؤشرات الشراكة الثلاثة وما يدعمها من مبادرات وشواهد موثّقة
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/indicators" variant="primary">
            استكشف مؤشرات الشراكة
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary" className="!bg-white/10 !text-white hover:!bg-white/20 !border-white/20">
            تواصل معنا
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
