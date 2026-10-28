import * as Icons from 'lucide-react';
import { InteractiveCard } from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';
import type { Initiative } from '@/types/database';
import { formatArabicDate } from '@/lib/utils';
import Link from 'next/link';

export function InitiativesPreviewSection({ initiatives }: { initiatives: Initiative[] }) {
  if (initiatives.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="mb-2 text-2xl font-extrabold text-navy-800 md:text-3xl">أحدث المبادرات والفعاليات</h2>
          <p className="text-navy-700/70">لمحة عن آخر ما وثّقته المدرسة من مبادرات الشراكة</p>
        </div>
        <ButtonLink href="/initiatives" variant="secondary">
          عرض جميع المبادرات
        </ButtonLink>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {initiatives.map((initiative) => {
          const Icon = (Icons as any)[initiative.cover_icon ?? 'Sparkles'] ?? Icons.Sparkles;
          return (
            <Link key={initiative.id} href={`/initiatives/${initiative.id}`}>
              <InteractiveCard className="h-full bg-gradient-to-br from-rose-50 to-white">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1 line-clamp-2 font-extrabold text-navy-800">{initiative.title}</h3>
                {initiative.execution_date && (
                  <p className="mb-3 text-xs font-semibold text-navy-500">
                    {formatArabicDate(initiative.execution_date)}
                  </p>
                )}
                {initiative.description && (
                  <p className="line-clamp-2 text-sm text-navy-700/75">{initiative.description}</p>
                )}
              </InteractiveCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
