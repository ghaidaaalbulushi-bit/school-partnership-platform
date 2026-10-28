import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getIndicatorById, getSectionTree, getSectionDetail, getPublishedIndicators } from '@/lib/data/indicators';
import { EvidenceList } from '@/components/files/EvidenceList';
import type { SectionTreeNode } from '@/types/database';

function flatten(nodes: SectionTreeNode[]): SectionTreeNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

export default async function PresentationIndicatorPage({ params }: { params: Promise<{ indicatorId: string }> }) {
  const { indicatorId } = await params;
  const [indicator, tree, allIndicators] = await Promise.all([
    getIndicatorById(indicatorId),
    getSectionTree(indicatorId),
    getPublishedIndicators(),
  ]);
  if (!indicator) notFound();

  const flatSections = flatten(tree);
  const sectionDetails = await Promise.all(flatSections.map((s) => getSectionDetail(s.id)));

  const idx = allIndicators.findIndex((i) => i.id === indicatorId);
  const prev = idx > 0 ? allIndicators[idx - 1] : null;
  const next = idx < allIndicators.length - 1 ? allIndicators[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-10 text-center">
        {indicator.code && <span className="mb-2 inline-block rounded-full bg-white/10 px-4 py-1 text-sm">المؤشر {indicator.code}</span>}
        <h1 className="mb-3 text-3xl font-extrabold">{indicator.title}</h1>
        <p className="mx-auto max-w-2xl text-cream-100/75">{indicator.description}</p>
      </div>

      <div className="space-y-12">
        {sectionDetails.map(({ section, blocks, evidence, links }) => {
          if (!section) return null;
          return (
            <section key={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-extrabold">{section.title}</h2>

              {blocks.map((block) =>
                block.block_type === 'rich_text' ? (
                  <div
                    key={block.id}
                    className="prose-rtl mb-4 max-w-none text-cream-100/85"
                    dangerouslySetInnerHTML={{ __html: block.content.html ?? '' }}
                  />
                ) : null
              )}

              {links.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {links.map((l) => (
                    <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-sky-500/20 px-3 py-1 text-sm text-sky-200 hover:bg-sky-500/30">
                      {l.title}
                    </a>
                  ))}
                </div>
              )}

              <div className="rounded-xl bg-white p-4 text-navy-800">
                <EvidenceList items={evidence} />
              </div>
            </section>
          );
        })}
        {flatSections.length === 0 && <p className="text-center text-cream-100/60">لا توجد أقسام لهذا المؤشر بعد.</p>}
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
        {prev ? (
          <Link href={`/presentation/${prev.id}`} className="flex items-center gap-2 text-sm font-bold hover:text-sky-300">
            <ChevronRight className="h-4 w-4" /> {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/presentation/${next.id}`} className="flex items-center gap-2 text-sm font-bold hover:text-sky-300">
            {next.title} <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
