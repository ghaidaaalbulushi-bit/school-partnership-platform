'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit, snapshotRevision } from '@/lib/admin/audit';

const TEXT_FIELDS = [
  'title',
  'introduction',
  'initiative_description',
  'goals',
  'target_group',
  'participating_parties',
  'execution_mechanism',
  'results_achievements',
  'impact_measurement',
  'recommendations',
] as const;

export async function createManualReportAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const { data, error } = await supabase.from('reports').insert({ title, status: 'draft', created_by: user.id }).select().single();
  if (error || !data) return;
  await logAudit(supabase, user, { action: 'create', entityType: 'reports', entityId: data.id });
  redirect(`/admin/reports/${data.id}`);
}

export async function updateReportAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));

  const update: Record<string, string | null> = {};
  for (const field of TEXT_FIELDS) {
    update[field] = String(formData.get(field) ?? '').trim() || null;
  }

  const indicatorIds = formData.getAll('indicator_ids').map(String);
  await supabase.from('report_indicators').delete().eq('report_id', id);
  if (indicatorIds.length > 0) {
    await supabase.from('report_indicators').insert(indicatorIds.map((indicator_id) => ({ report_id: id, indicator_id })));
  }

  const { data: before } = await supabase.from('reports').select('*').eq('id', id).single();
  const { error } = await supabase.from('reports').update(update).eq('id', id);
  if (!error) {
    if (before) await snapshotRevision(supabase, user, 'reports', id, before);
    await logAudit(supabase, user, { action: 'update', entityType: 'reports', entityId: id, beforeData: before });
  }
  revalidatePath(`/admin/reports/${id}`);
  revalidatePath('/admin/reports');
}

export async function togglePublishReportAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const current = String(formData.get('status'));
  const next = current === 'published' ? 'draft' : 'published';
  await supabase.from('reports').update({ status: next }).eq('id', id);
  await logAudit(supabase, user, { action: next === 'published' ? 'publish' : 'unpublish', entityType: 'reports', entityId: id });
  revalidatePath('/admin/reports');
  revalidatePath(`/admin/reports/${id}`);
}

export async function deleteReportAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const { data: before } = await supabase.from('reports').select('*').eq('id', id).single();
  await supabase.from('reports').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'reports', entityId: id, beforeData: before });
  revalidatePath('/admin/reports');
}
