/**
 * Pure CSS/SVG decorative hero background — no photos, no AI-generated
 * imagery, per the project's visual constraints. Soft waves, a scatter of
 * gentle geometric shapes, and a few plant-inspired strokes, all drawn in
 * code so the page looks complete even before any real photos are uploaded.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-cream-50 to-mint-50" />

      {/* Drifting wave band along the bottom */}
      <svg
        className="absolute bottom-0 left-0 w-[200%] animate-wave-drift"
        viewBox="0 0 1600 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,110 C200,180 400,40 600,110 C800,180 1000,40 1200,110 C1300,145 1500,145 1600,110 L1600,220 L0,220 Z"
          fill="url(#waveGradient1)"
          opacity="0.5"
        />
        <path
          d="M0,150 C250,90 450,200 700,140 C950,80 1150,190 1400,130 C1480,110 1550,120 1600,140 L1600,220 L0,220 Z"
          fill="url(#waveGradient2)"
          opacity="0.45"
        />
        <defs>
          <linearGradient id="waveGradient1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#baf3d2" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fda4b8" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating geometric accents */}
      <svg
        className="absolute end-[8%] top-[12%] h-20 w-20 animate-float-slow text-sky-300/60 md:h-28 md:w-28"
        viewBox="0 0 100 100"
        fill="none"
      >
        <rect x="10" y="10" width="80" height="80" rx="22" stroke="currentColor" strokeWidth="6" />
      </svg>

      <svg
        className="absolute start-[10%] top-[22%] h-14 w-14 animate-float-slower text-gold-400/70 md:h-20 md:w-20"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="6" />
      </svg>

      <svg
        className="absolute end-[20%] top-[55%] h-16 w-16 animate-float-slow text-rose-300/60 md:h-24 md:w-24"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path d="M50 8 L92 50 L50 92 L8 50 Z" stroke="currentColor" strokeWidth="6" />
      </svg>

      {/* Simple plant motif, bottom-start corner */}
      <svg
        className="absolute bottom-0 start-[4%] h-40 w-24 text-mint-500/50 md:h-56 md:w-32"
        viewBox="0 0 120 220"
        fill="none"
      >
        <path d="M60 220 C60 160 60 120 60 60" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <path d="M60 150 C40 140 20 150 10 130 C30 125 48 132 60 150Z" fill="currentColor" opacity="0.7" />
        <path d="M60 110 C80 100 100 108 112 88 C90 85 70 92 60 110Z" fill="currentColor" opacity="0.5" />
        <path d="M60 80 C42 68 24 72 16 52 C36 50 54 58 60 80Z" fill="currentColor" opacity="0.6" />
      </svg>

      {/* Scatter of soft dots */}
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <circle cx="15%" cy="35%" r="4" fill="#0ea5e9" />
        <circle cx="85%" cy="18%" r="3" fill="#f59e0b" />
        <circle cx="70%" cy="75%" r="5" fill="#22c55e" />
        <circle cx="30%" cy="80%" r="3" fill="#fda4b8" />
        <circle cx="92%" cy="60%" r="4" fill="#38bdf8" />
      </svg>
    </div>
  );
}
