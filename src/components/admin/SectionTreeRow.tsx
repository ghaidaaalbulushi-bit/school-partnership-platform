'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronLeft, ArrowUp, ArrowDown, Trash2, Eye, EyeOff } from 'lucide-react';
import { togglePublishSectionAction, deleteSectionAction, reorderSectionAction } from '@/app/admin/(dashboard)/indicators/[id]/sections/actions';
import type { SectionTreeNode } from '@/types/database';

export function SectionTreeRow({
  section,
  indicatorId,
  depth = 0,
  isFirst,
  isLast,
}: {
  section: SectionTreeNode;
  indicatorId: string;
  depth?: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = section.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 rounded-xl border border-sky-100 bg-white p-3"
        style={{ marginInlineStart: depth * 24 }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded((v) => !v)} className="shrink-0 rounded p-1 text-navy-400 hover:bg-sky-50">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-navy-800">{section.title}</p>
          {section.description && <p className="truncate text-xs text-navy-500">{section.description}</p>}
        </div>

        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${section.status === 'published' ? 'bg-mint-100 text-mint-700' : 'bg-gold-100 text-gold-500'}`}>
          {section.status === 'published' ? 'منشور' : 'مسودة'}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <form action={reorderSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="indicator_id" value={indicatorId} />
            <input type="hidden" name="parent_section_id" value={section.parent_section_id ?? ''} />
            <input type="hidden" name="direction" value="up" />
            <button type="submit" disabled={isFirst} className="rounded-lg p-1.5 text-navy-400 hover:bg-sky-50 disabled:opacity-30">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </form>
          <form action={reorderSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="indicator_id" value={indicatorId} />
            <input type="hidden" name="parent_section_id" value={section.parent_section_id ?? ''} />
            <input type="hidden" name="direction" value="down" />
            <button type="submit" disabled={isLast} className="rounded-lg p-1.5 text-navy-400 hover:bg-sky-50 disabled:opacity-30">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </form>
          <Link href={`/admin/sections/${section.id}`} className="rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100">
            إدارة
          </Link>
          <form action={togglePublishSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="indicator_id" value={indicatorId} />
            <input type="hidden" name="status" value={section.status} />
            <button type="submit" className="rounded-lg p-1.5 text-navy-500 hover:bg-sky-50">
              {section.status === 'published' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </form>
          <form action={deleteSectionAction}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="indicator_id" value={indicatorId} />
            <button type="submit" className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="mt-2 space-y-2">
          {section.children.map((child, i) => (
            <SectionTreeRow
              key={child.id}
              section={child}
              indicatorId={indicatorId}
              depth={depth + 1}
              isFirst={i === 0}
              isLast={i === section.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
