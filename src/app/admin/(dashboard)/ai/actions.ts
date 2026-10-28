'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit } from '@/lib/admin/audit';

export async function approveAnalysisAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const mediaFileId = String(formData.get('media_file_id'));
  const sectionId = String(formData.get('section_id') ?? '') || null;
  const indicatorIds = formData.getAll('indicator_ids').map(String);
  const title = String(formData.get('title') ?? '').trim() || null;

  const { data: analysis } = await supabase.from('ai_analyses').select('*').eq('id', id).single();
  if (!analysis) return;

  const manual_override =
    sectionId !== analysis.suggested_section_id ||
    JSON.stringify(indicatorIds.sort()) !== JSON.stringify((analysis.suggested_indicator_ids ?? []).slice().sort())
      ? { section_id: sectionId, indicator_ids: indicatorIds }
      : null;

  await supabase
    .from('ai_analyses')
    .update({ approved: true, approved_by: user.id, approved_at: new Date().toISOString(), manual_override })
    .eq('id', id);

  if (sectionId) {
    const { data: evidence } = await supabase
      .from('evidence')
      .insert({ section_id: sectionId, media_file_id: mediaFileId, title: title ?? analysis.document_type, status: 'published' })
      .select()
      .single();

    if (evidence && indicatorIds.length > 0) {
      await supabase
        .from('evidence_indicators')
        .insert(indicatorIds.map((indicator_id) => ({ evidence_id: evidence.id, indicator_id })));
    }
  }

  await logAudit(supabase, user, { action: 'update', entityType: 'ai_analyses', entityId: id, afterData: { approved: true } });
  revalidatePath('/admin/ai');
  revalidatePath('/', 'layout');
}

export async function dismissAnalysisAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  await supabase.from('ai_analyses').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'ai_analyses', entityId: id });
  revalidatePath('/admin/ai');
}
