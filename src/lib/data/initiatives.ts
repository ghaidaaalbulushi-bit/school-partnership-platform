import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Initiative } from '@/types/database';

export async function getPublishedInitiatives(opts?: { indicatorId?: string; limit?: number }): Promise<Initiative[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('initiatives')
    .select('*, initiative_indicators(indicator_id)')
    .eq('status', 'published')
    .order('execution_date', { ascending: false, nullsFirst: false });

  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(`تعذّر تحميل المبادرات: ${error.message}`);

  let rows = (data as any[]) ?? [];
  if (opts?.indicatorId) {
    rows = rows.filter((r) => r.initiative_indicators?.some((ii: any) => ii.indicator_id === opts.indicatorId));
  }

  return rows.map((r) => ({
    ...r,
    indicator_ids: r.initiative_indicators?.map((ii: any) => ii.indicator_id) ?? [],
  })) as Initiative[];
}

export async function getInitiativeById(id: string): Promise<Initiative | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('initiatives')
    .select(
      '*, initiative_indicators(indicator_id), initiative_media(media_file:media_files(*)), initiative_links(*)'
    )
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  const row = data as any;
  return {
    ...row,
    indicator_ids: row.initiative_indicators?.map((ii: any) => ii.indicator_id) ?? [],
    media: row.initiative_media?.map((im: any) => im.media_file) ?? [],
    links: row.initiative_links ?? [],
  } as Initiative;
}
