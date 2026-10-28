import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SectionRow, SectionTreeNode } from '@/types/database';

/** Same tree-building logic as the public getSectionTree, but includes
 * draft sections too — for the admin view. */
export async function getAdminSectionTree(indicatorId: string): Promise<SectionTreeNode[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('sections').select('*').eq('indicator_id', indicatorId).order('sort_order');
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
