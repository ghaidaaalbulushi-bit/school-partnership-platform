import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Evidence } from '@/types/database';

export interface EvidenceWithContext extends Evidence {
  indicator_id: string | null;
  indicator_title: string | null;
}

/** All published evidence, with its owning indicator (via its section) for
 * grouping on the public "الشواهد والأدلة" page. */
export async function getAllPublishedEvidence(): Promise<EvidenceWithContext[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('evidence')
    .select('*, media_file:media_files(*), section:sections(id, title, indicator_id, indicator:indicators(id, title))')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return (data as any[]).map((row) => ({
    ...row,
    indicator_id: row.section?.indicator?.id ?? null,
    indicator_title: row.section?.indicator?.title ?? null,
  }));
}
