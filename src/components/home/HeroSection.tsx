import { HeroBackground } from '@/components/decor/HeroBackground';
import { ButtonLink } from '@/components/ui/Button';
import type { SiteSettings } from '@/types/database';

export function HeroSection({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <HeroBackground />
      <div className="relative mx-auto max-w-4xl text-center">
        <span className="mb-5 inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-sky-600 shadow-soft">
          {settings.hero_subtitle}
        </span>
        <h1 className="mb-5 text-3xl font-extrabold leading-tight text-navy-800 md:text-5xl">
          {settings.hero_title}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg font-semibold text-navy-700/90 md:text-xl">
          {settings.hero_tagline}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href={settings.hero_cta_primary_href} variant="primary" className="text-base">
            {settings.hero_cta_primary_label}
          </ButtonLink>
          <ButtonLink href={settings.hero_cta_secondary_href} variant="secondary" className="text-base">
            {settings.hero_cta_secondary_label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
