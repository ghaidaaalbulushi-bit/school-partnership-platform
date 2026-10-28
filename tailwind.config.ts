import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Design tokens — overridable at runtime via CSS variables set from
        // the `theme_settings` table (see src/lib/theme.ts). Defaults below
        // match the requested palette: calm sky blue, navy, creamy beige,
        // mint green, light gold, soft peach/rose, bright white.
        sky: {
          50: 'var(--color-sky-50, #f0f9ff)',
          100: 'var(--color-sky-100, #e0f2fe)',
          200: 'var(--color-sky-200, #bae6fd)',
          300: 'var(--color-sky-300, #7dd3fc)',
          400: 'var(--color-sky-400, #38bdf8)',
          500: 'var(--color-sky-500, #0ea5e9)',
          600: 'var(--color-sky-600, #0284c7)',
        },
        navy: {
          600: 'var(--color-navy-600, #1e3a5f)',
          700: 'var(--color-navy-700, #16304d)',
          800: 'var(--color-navy-800, #0f233a)',
          900: 'var(--color-navy-900, #0a1a2b)',
        },
        cream: {
          50: 'var(--color-cream-50, #fdfbf5)',
          100: 'var(--color-cream-100, #faf5e8)',
          200: 'var(--color-cream-200, #f3ead1)',
        },
        mint: {
          50: 'var(--color-mint-50, #f0fdf7)',
          100: 'var(--color-mint-100, #dcfce9)',
          200: 'var(--color-mint-200, #baf3d2)',
          400: 'var(--color-mint-400, #4ade80)',
          500: 'var(--color-mint-500, #22c55e)',
          600: 'var(--color-mint-600, #16a34a)',
        },
        gold: {
          100: 'var(--color-gold-100, #fef7e0)',
          300: 'var(--color-gold-300, #fcd34d)',
          400: 'var(--color-gold-400, #fbbf24)',
          500: 'var(--color-gold-500, #f59e0b)',
        },
        peach: {
          50: 'var(--color-peach-50, #fff7f2)',
          100: 'var(--color-peach-100, #ffe9dc)',
          300: 'var(--color-peach-300, #ffb997)',
        },
        rose: {
          50: 'var(--color-rose-50, #fff1f4)',
          100: 'var(--color-rose-100, #ffe1e8)',
          300: 'var(--color-rose-300, #fda4b8)',
        },
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'Tajawal', 'sans-serif'],
        tajawal: ['var(--font-tajawal)', 'Tajawal', 'Cairo', 'sans-serif'],
      },
      borderRadius: {
        '2.5xl': '1.375rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(15, 35, 58, 0.08)',
        card: '0 2px 12px -2px rgba(15, 35, 58, 0.06), 0 8px 28px -8px rgba(15, 35, 58, 0.10)',
        'card-hover': '0 6px 20px -4px rgba(15, 35, 58, 0.10), 0 14px 40px -10px rgba(15, 35, 58, 0.16)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wave-drift': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 7s ease-in-out infinite',
        'float-slower': 'float-slower 9s ease-in-out infinite',
        'wave-drift': 'wave-drift 22s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
