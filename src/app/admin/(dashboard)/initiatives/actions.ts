'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit, snapshotRevision } from '@/lib/admin/audit';

const TEXT_FIELDS = [
  'title',
  'description',
  'location',
  'target_group',
  'participating_parties',
  'goals',
  'execution_mechanism',
  'results',
  'impact_measurement',
  'recommendations',
] as const;

export async function createInitiativeAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const execution_date = String(formData.get('execution_date') ?? '') || null;
  const { data, error } = await supabase
    .from('initiatives')
    .insert({ title, execution_date, status: 'draft' })
    .select()
    .single();

  if (error || !data) return;
  await logAudit(supabase, user, { action: 'create', entityType: 'initiatives', entityId: data.id, afterData: data });
  revalidatePath('/admin/initiatives');
  return data.id as string;
}

export async function updateInitiativeAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));

  const update: Record<string, string | null> = {};
  for (const field of TEXT_FIELDS) {
    update[field] = String(formData.get(field) ?? '').trim() || null;
  }
  update.execution_date = String(formData.get('execution_date') ?? '') || null;

  const { data: before } = await supabase.from('initiatives').select('*').eq('id', id).single();
  const { error } = await supabase.from('initiatives').update(update).eq('id', id);

  // indicator links: replace all
  const indicatorIds = formData.getAll('indicator_ids').map(String);
  await supabase.from('initiative_indicators').delete().eq('initiative_id', id);
  if (indicatorIds.length > 0) {
    await supabase.from('initiative_indicators').insert(indicatorIds.map((indicator_id) => ({ initiative_id: id, indicator_id })));
  }

  if (!error) {
    if (before) await snapshotRevision(supabase, user, 'initiatives', id, before);
    await logAudit(supabase, user, { action: 'update', entityType: 'initiatives', entityId: id, beforeData: before });
  }
  revalidatePath('/admin/initiatives');
  revalidatePath(`/admin/initiatives/${id}`);
  revalidatePath('/', 'layout');
}

export async function togglePublishInitiativeAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const current = String(formData.get('status'));
  const next = current === 'published' ? 'draft' : 'published';
  await supabase.from('initiatives').update({ status: next }).eq('id', id);
  await logAudit(supabase, user, { action: next === 'published' ? 'publish' : 'unpublish', entityType: 'initiatives', entityId: id });
  revalidatePath('/admin/initiatives');
  revalidatePath('/', 'layout');
}

export async function deleteInitiativeAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const { data: before } = await supabase.from('initiatives').select('*').eq('id', id).single();
  await supabase.from('initiatives').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'initiatives', entityId: id, beforeData: before });
  revalidatePath('/admin/initiatives');
  revalidatePath('/', 'layout');
}

export async function attachInitiativeMediaAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const initiative_id = String(formData.get('initiative_id'));
  const media_file_id = String(formData.get('media_file_id'));
  if (!media_file_id) return;
  await supabase.from('initiative_media').insert({ initiative_id, media_file_id });
  await logAudit(supabase, user, { action: 'create', entityType: 'initiative_media', entityId: initiative_id });
  revalidatePath(`/admin/initiatives/${initiative_id}`);
  revalidatePath('/', 'layout');
}

export async function removeInitiativeMediaAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const initiative_id = String(formData.get('initiative_id'));
  const media_file_id = String(formData.get('media_file_id'));
  await supabase.from('initiative_media').delete().eq('initiative_id', initiative_id).eq('media_file_id', media_file_id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'initiative_media', entityId: initiative_id });
  revalidatePath(`/admin/initiatives/${initiative_id}`);
  revalidatePath('/', 'layout');
}

export async function addInitiativeLinkAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const initiative_id = String(formData.get('initiative_id'));
  const title = String(formData.get('title') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  if (!title || !/^https?:\/\//i.test(url)) return;
  await supabase.from('initiative_links').insert({ initiative_id, title, url });
  await logAudit(supabase, user, { action: 'create', entityType: 'initiative_links', entityId: initiative_id });
  revalidatePath(`/admin/initiatives/${initiative_id}`);
  revalidatePath('/', 'layout');
}

export async function deleteInitiativeLinkAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const initiative_id = String(formData.get('initiative_id'));
  await supabase.from('initiative_links').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'initiative_links', entityId: id });
  revalidatePath(`/admin/initiatives/${initiative_id}`);
  revalidatePath('/', 'layout');
}
