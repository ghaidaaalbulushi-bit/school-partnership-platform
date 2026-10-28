import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import type { Indicator } from '@/types/database';
import { cn } from '@/lib/utils';

const THEME_CLASSES: Record<string, { bg: string; ring: string; icon: string; chip: string }> = {
  sky: { bg: 'from-sky-50 to-white', ring: 'ring-sky-200', icon: 'text-sky-600 bg-sky-100', chip: 'bg-sky-100 text-sky-700' },
  mint: { bg: 'from-mint-50 to-white', ring: 'ring-mint-200', icon: 'text-mint-600 bg-mint-100', chip: 'bg-mint-100 text-mint-700' },
  peach: { bg: 'from-peach-50 to-white', ring: 'ring-peach-100', icon: 'text-amber-600 bg-peach-100', chip: 'bg-peach-100 text-amber-700' },
};

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const theme = THEME_CLASSES[indicator.color_theme ?? 'sky'] ?? THEME_CLASSES.sky;
  const Icon = (Icons as any)[indicator.icon ?? 'Users'] ?? Icons.Users;

  return (
    <Link
      href={`/indicators/${indicator.id}`}
      className={cn(
        'group relative block overflow-hidden rounded-3xl bg-gradient-to-br p-7 ring-1 transition-all duration-300',
        'hover:-translate-y-1.5 hover:shadow-card-hover',
        theme!.bg,
        theme!.ring
      )}
    >
      <div className={cn('mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl', theme!.icon)}>
        <Icon className="h-7 w-7" />
      </div>

      {indicator.code && (
        <span className={cn('mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold', theme!.chip)}>
          المؤشر {indicator.code}
        </span>
      )}

      <h3 className="mb-2 text-xl font-extrabold text-navy-800">{indicator.title}</h3>
      <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-navy-700/80">{indicator.description}</p>

      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-800 transition-transform group-hover:-translate-x-1">
        عرض التفاصيل
        <ArrowLeft className="h-4 w-4" />
      </span>
    </Link>
  );
}
