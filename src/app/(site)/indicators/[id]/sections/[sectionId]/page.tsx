import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Link as LinkIcon, ExternalLink } from 'lucide-react';
import * as Icons from 'lucide-react';
import { getIndicatorById, getSectionDetail } from '@/lib/data/indicators';
import { SectionCard } from '@/components/SectionCard';
import { EvidenceList } from '@/components/files/EvidenceList';
import { Card } from '@/components/ui/Card';

export const revalidate = 60;

export default async function SectionDetailPage({
  params,
}: {
  params: Promise<{ id: string; sectionId: string }>;
}) {
  const { id, sectionId } = await params;
  const [indicator, detail] = await Promise.all([getIndicatorById(id), getSectionDetail(sectionId)]);

  if (!indicator || !detail.section) notFound();
  const { section, blocks, evidence, links, children } = detail;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-navy-500">
        <Link href="/indicators" className="hover:text-sky-600">المؤشرات</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <Link href={`/indicators/${id}`} className="hover:text-sky-600">{indicator.title}</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-semibold text-navy-700">{section!.title}</span>
      </nav>

      <h1 className="mb-3 text-2xl font-extrabold text-navy-800 md:text-3xl">{section!.title}</h1>
      {section!.description && <p className="mb-8 leading-relaxed text-navy-700/80">{section!.description}</p>}

      {/* Rich text / table content blocks */}
      {blocks.length > 0 && (
        <div className="mb-10 space-y-6">
          {blocks.map((block) =>
            block.block_type === 'rich_text' ? (
              <div
                key={block.id}
                className="prose-rtl max-w-none rounded-2xl border border-sky-100 bg-white p-6"
                dangerouslySetInnerHTML={{ __html: block.content.html ?? '' }}
              />
            ) : (
              <div key={block.id} className="overflow-x-auto rounded-2xl border border-sky-100 bg-white p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sky-100 text-start">
                      {block.content.headers?.map((h, i) => (
                        <th key={i} className="p-2 font-bold text-navy-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.content.rows?.map((row, ri) => (
                      <tr key={ri} className="border-b border-sky-50">
                        {row.map((cell, ci) => (
                          <td key={ci} className="p-2 text-navy-700/85">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* Sub-sections, if any — the recursive "click to open" structure */}
      {children.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-extrabold text-navy-800">الأقسام الفرعية</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => (
              <SectionCard key={child.id} section={child} href={`/indicators/${id}/sections/${child.id}`} />
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {links.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-navy-800">
            <LinkIcon className="h-5 w-5" /> روابط ذات صلة
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = (Icons as any)[link.icon ?? 'Link'] ?? Icons.Link;
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.opens_new_tab ? '_blank' : undefined}
                  rel={link.opens_new_tab ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-4 transition hover:border-sky-300 hover:shadow-soft"
                >
                  <Icon className="h-5 w-5 shrink-0 text-sky-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-navy-700">{link.title}</span>
                    {link.description && <span className="block truncate text-xs text-navy-500">{link.description}</span>}
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-navy-300 group-hover:text-sky-500" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence files */}
      <div>
        <h2 className="mb-4 text-lg font-extrabold text-navy-800">الملفات والشواهد</h2>
        <Card>
          <EvidenceList items={evidence} />
        </Card>
      </div>
    </div>
  );
}
