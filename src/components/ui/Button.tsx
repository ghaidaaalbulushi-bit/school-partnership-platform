import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-sky-500 text-white hover:bg-sky-600 shadow-soft hover:shadow-card focus-visible:ring-sky-300',
  secondary:
    'bg-white text-navy-700 border border-sky-200 hover:bg-sky-50 focus-visible:ring-sky-200',
  ghost: 'bg-transparent text-navy-700 hover:bg-sky-50 focus-visible:ring-sky-200',
  danger: 'bg-rose-300 text-navy-900 hover:bg-rose-300/80 focus-visible:ring-rose-200',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50';

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(baseClasses, variantClasses[variant], className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = 'primary',
  className,
  children,
  newTab,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  newTab?: boolean;
}) {
  return (
    <Link
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </Link>
  );
}
