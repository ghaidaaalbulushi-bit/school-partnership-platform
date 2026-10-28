import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Indicator, SectionRow, SectionTreeNode, Evidence, LinkItem, SectionBlock } from '@/types/database';

export async function getPublishedIndicators(): Promise<Indicator[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('indicators')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(`تعذّر تحميل المؤشرات: ${error.message}`);
  return (data as Indicator[]) ?? [];
}

export async function getIndicatorById(id: string): Promise<Indicator | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('indicators').select('*').eq('id', id).eq('status', 'published').single();
  return (data as Indicator) ?? null;
}

/** Builds the full section tree for an indicator, with all descendant
 * levels nested, matching the "sections can contain sub-sections, which can
 * contain further sub-sections" requirement. */
export async function getSectionTree(indicatorId: string): Promise<SectionTreeNode[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('indicator_id', indicatorId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`تعذّر تحميل الأقسام: ${error.message}`);
  const rows = (data as SectionRow[]) ?? [];

  const byId = new Map<string, SectionTreeNode>();
  rows.forEach((r) => byId.set(r.id, { ...r, children: [] }));

  const roots: SectionTreeNode[] = [];
  byId.forEach((node) => {
    if (node.parent_section_id && byId.has(node.parent_section_id)) {
      byId.get(node.parent_section_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export async function getSectionDetail(sectionId: string): Promise<{
  section: SectionRow | null;
  blocks: SectionBlock[];
  evidence: Evidence[];
  links: LinkItem[];
  children: SectionRow[];
}> {
  const supabase = await createServerSupabaseClient();

  const [{ data: section }, { data: blocks }, { data: evidenceRows }, { data: links }, { data: children }] =
    await Promise.all([
      supabase.from('sections').select('*').eq('id', sectionId).eq('status', 'published').single(),
      supabase.from('section_blocks').select('*').eq('section_id', sectionId).order('sort_order'),
      supabase
        .from('evidence')
        .select('*, media_file:media_files(*)')
        .eq('section_id', sectionId)
        .eq('status', 'published')
        .order('sort_order'),
      supabase.from('links').select('*').eq('section_id', sectionId).eq('status', 'published').order('sort_order'),
      supabase.from('sections').select('*').eq('parent_section_id', sectionId).eq('status', 'published').order('sort_order'),
    ]);

  return {
    section: (section as SectionRow) ?? null,
    blocks: (blocks as SectionBlock[]) ?? [],
    evidence: (evidenceRows as Evidence[]) ?? [],
    links: (links as LinkItem[]) ?? [],
    children: (children as SectionRow[]) ?? [],
  };
}
