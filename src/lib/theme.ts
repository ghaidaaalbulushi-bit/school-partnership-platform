import type { ThemeSettings } from '@/types/database';

/** Maps theme_settings.colors (flat key->hex map) to CSS custom properties
 * consumed by tailwind.config.ts color tokens. Keeps the DB shape simple
 * (one jsonb column) while still driving every Tailwind color token. */
export function themeToCssVars(colors: ThemeSettings['colors']): string {
  const map: Record<string, string> = {
    'sky500': '--color-sky-500',
    'sky400': '--color-sky-400',
    'sky600': '--color-sky-600',
    'navy700': '--color-navy-700',
    'navy800': '--color-navy-800',
    'cream50': '--color-cream-50',
    'mint500': '--color-mint-500',
    'gold500': '--color-gold-500',
    'peach300': '--color-peach-300',
    'rose300': '--color-rose-300',
  };

  const declarations = Object.entries(map)
    .filter(([key]) => colors[key])
    .map(([key, cssVar]) => `${cssVar}: ${colors[key]};`)
    .join(' ');

  return `:root { ${declarations} }`;
}

export const FONT_SCALE_CLASS: Record<ThemeSettings['font_scale'], string> = {
  sm: 'text-[15px]',
  md: 'text-base',
  lg: 'text-lg',
};

export const CARD_STYLE_CLASS: Record<ThemeSettings['card_style'], string> = {
  'rounded-soft': 'rounded-2.5xl',
  'rounded-sharp': 'rounded-lg',
  flat: 'rounded-none',
};
