import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2.5xl border border-sky-100/80 bg-white/90 p-6 shadow-card backdrop-blur-sm',
        'transition-all duration-300',
        className
      )}
      {...props}
    />
  );
}

export function InteractiveCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:-translate-y-1 hover:shadow-card-hover',
        'focus-within:-translate-y-1 focus-within:shadow-card-hover',
        className
      )}
      {...props}
    />
  );
}
