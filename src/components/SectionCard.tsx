import Link from 'next/link';
import * as Icons from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { InteractiveCard } from '@/components/ui/Card';
import type { SectionRow } from '@/types/database';

export function SectionCard({ section, href }: { section: SectionRow; href: string }) {
  const Icon = (Icons as any)[section.icon ?? 'FolderOpen'] ?? Icons.FolderOpen;

  return (
    <Link href={href}>
      <InteractiveCard className="flex h-full items-start gap-4">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 font-extrabold text-navy-800">{section.title}</h3>
          {section.description && (
            <p className="line-clamp-2 text-sm text-navy-700/75">{section.description}</p>
          )}
        </div>
        <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-navy-400" />
      </InteractiveCard>
    </Link>
  );
}
