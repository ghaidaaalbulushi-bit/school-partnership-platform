/** A thin decorative wave used to separate page sections without a hard line. */
export function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 60"
      className={`h-10 w-full text-cream-100 ${flip ? 'rotate-180' : ''}`}
      preserveAspectRatio="none"
      fill="currentColor"
    >
      <path d="M0,30 C300,60 900,0 1200,30 L1200,60 L0,60 Z" />
    </svg>
  );
}

/** Small decorative corner flourish used on cards. */
export function CardCorner({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 60 60" className={className} fill="none">
      <path d="M4 56 C4 30 30 4 56 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}
