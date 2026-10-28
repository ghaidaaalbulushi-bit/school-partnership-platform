import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface PlatformStats {
  indicatorsCount: number;
  initiativesCount: number;
  eventsCount: number; // initiatives with an execution_date = treated as "events"
  evidenceCount: number;
  reportsCount: number;
  mediaFilesCount: number;
  aiAnalysesPending: number;
  participatingPartiesCount: number | null; // only when data exists to count distinct parties
}

/** All counts come straight from the database — never hardcoded, never
 * estimated. A genuinely empty table yields 0, not a placeholder number. */
export async function getPlatformStats(): Promise<PlatformStats> {
  const supabase = await createServerSupabaseClient();

  const [indicators, initiatives, eventsWithDate, evidence, reports, mediaFiles, aiPending, partiesRows] =
    await Promise.all([
      supabase.from('indicators').select('id', { count: 'exact', head: true }),
      supabase.from('initiatives').select('id', { count: 'exact', head: true }),
      supabase.from('initiatives').select('id', { count: 'exact', head: true }).not('execution_date', 'is', null),
      supabase.from('evidence').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }),
      supabase.from('media_files').select('id', { count: 'exact', head: true }),
      supabase.from('ai_analyses').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('initiatives').select('participating_parties').not('participating_parties', 'is', null),
    ]);

  const distinctParties = new Set(
    (partiesRows.data ?? [])
      .map((r: any) => (r.participating_parties as string)?.trim())
      .filter(Boolean)
  );

  return {
    indicatorsCount: indicators.count ?? 0,
    initiativesCount: initiatives.count ?? 0,
    eventsCount: eventsWithDate.count ?? 0,
    evidenceCount: evidence.count ?? 0,
    reportsCount: reports.count ?? 0,
    mediaFilesCount: mediaFiles.count ?? 0,
    aiAnalysesPending: aiPending.count ?? 0,
    participatingPartiesCount: distinctParties.size > 0 ? distinctParties.size : null,
  };
}
