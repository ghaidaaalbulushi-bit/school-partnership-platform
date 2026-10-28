'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit, snapshotRevision } from '@/lib/admin/audit';

export async function createSectionAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const indicator_id = String(formData.get('indicator_id'));
  const parent_section_id = String(formData.get('parent_section_id') ?? '') || null;
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  if (!title) return;

  const { data: maxRow } = await supabase
    .from('sections')
    .select('sort_order')
    .eq('indicator_id', indicator_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('sections')
    .insert({ indicator_id, parent_section_id, title, description, sort_order: (maxRow?.sort_order ?? 0) + 1, status: 'published' })
    .select()
    .single();

  if (!error && data) await logAudit(supabase, user, { action: 'create', entityType: 'sections', entityId: data.id, afterData: data });
  revalidatePath(`/admin/indicators/${indicator_id}/sections`);
  revalidatePath('/', 'layout');
}

export async function updateSectionAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const indicator_id = String(formData.get('indicator_id'));
  const update = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim() || null,
    icon: String(formData.get('icon') ?? 'FolderOpen'),
  };
  const { data: before } = await supabase.from('sections').select('*').eq('id', id).single();
  const { error } = await supabase.from('sections').update(update).eq('id', id);
  if (!error) {
    if (before) await snapshotRevision(supabase, user, 'sections', id, before);
    await logAudit(supabase, user, { action: 'update', entityType: 'sections', entityId: id, beforeData: before });
  }
  revalidatePath(`/admin/indicators/${indicator_id}/sections`);
  revalidatePath('/', 'layout');
}

export async function togglePublishSectionAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const indicator_id = String(formData.get('indicator_id'));
  const current = String(formData.get('status'));
  const next = current === 'published' ? 'draft' : 'published';
  await supabase.from('sections').update({ status: next }).eq('id', id);
  await logAudit(supabase, user, { action: next === 'published' ? 'publish' : 'unpublish', entityType: 'sections', entityId: id });
  revalidatePath(`/admin/indicators/${indicator_id}/sections`);
  revalidatePath('/', 'layout');
}

export async function deleteSectionAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const indicator_id = String(formData.get('indicator_id'));
  const { data: before } = await supabase.from('sections').select('*').eq('id', id).single();
  await supabase.from('sections').delete().eq('id', id); // cascades to children, blocks, evidence, links
  await logAudit(supabase, user, { action: 'delete', entityType: 'sections', entityId: id, beforeData: before });
  revalidatePath(`/admin/indicators/${indicator_id}/sections`);
  revalidatePath('/', 'layout');
}

export async function reorderSectionAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const indicator_id = String(formData.get('indicator_id'));
  const direction = String(formData.get('direction'));
  const parentKey = String(formData.get('parent_section_id') ?? '') || null;

  let query = supabase.from('sections').select('id, sort_order').eq('indicator_id', indicator_id).order('sort_order');
  query = parentKey ? query.eq('parent_section_id', parentKey) : query.is('parent_section_id', null);
  const { data: siblings } = await query;
  if (!siblings) return;

  const idx = siblings.findIndex((r) => r.id === id);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= siblings.length) return;

  const a = siblings[idx]!;
  const b = siblings[swapIdx]!;
  await supabase.from('sections').update({ sort_order: b.sort_order }).eq('id', a.id);
  await supabase.from('sections').update({ sort_order: a.sort_order }).eq('id', b.id);

  revalidatePath(`/admin/indicators/${indicator_id}/sections`);
  revalidatePath('/', 'layout');
}

// ---- content blocks ----
export async function addRichTextBlockAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const section_id = String(formData.get('section_id'));
  const html = String(formData.get('html') ?? '');
  const { data: maxRow } = await supabase.from('section_blocks').select('sort_order').eq('section_id', section_id).order('sort_order', { ascending: false }).limit(1).single();
  const { data, error } = await supabase
    .from('section_blocks')
    .insert({ section_id, block_type: 'rich_text', content: { html }, sort_order: (maxRow?.sort_order ?? 0) + 1 })
    .select()
    .single();
  if (!error && data) await logAudit(supabase, user, { action: 'create', entityType: 'section_blocks', entityId: data.id });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}

export async function updateBlockAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const section_id = String(formData.get('section_id'));
  const html = String(formData.get('html') ?? '');
  await supabase.from('section_blocks').update({ content: { html } }).eq('id', id);
  await logAudit(supabase, user, { action: 'update', entityType: 'section_blocks', entityId: id });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}

export async function deleteBlockAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const section_id = String(formData.get('section_id'));
  await supabase.from('section_blocks').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'section_blocks', entityId: id });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}

// ---- links ----
export async function addLinkAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const section_id = String(formData.get('section_id'));
  const title = String(formData.get('title') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  if (!title || !/^https?:\/\//i.test(url)) return;
  const opens_new_tab = formData.get('opens_new_tab') === 'on';

  const { data: maxRow } = await supabase.from('links').select('sort_order').eq('section_id', section_id).order('sort_order', { ascending: false }).limit(1).single();
  const { data, error } = await supabase
    .from('links')
    .insert({ section_id, title, url, opens_new_tab, sort_order: (maxRow?.sort_order ?? 0) + 1 })
    .select()
    .single();
  if (!error && data) await logAudit(supabase, user, { action: 'create', entityType: 'links', entityId: data.id, afterData: data });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}

export async function deleteLinkAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const section_id = String(formData.get('section_id'));
  await supabase.from('links').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'links', entityId: id });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}

// ---- evidence: attach an already-uploaded media file to this section ----
export async function attachEvidenceAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const section_id = String(formData.get('section_id'));
  const media_file_id = String(formData.get('media_file_id'));
  const title = String(formData.get('title') ?? '').trim() || null;
  if (!media_file_id) return;

  const { data, error } = await supabase
    .from('evidence')
    .insert({ section_id, media_file_id, title, status: 'published' })
    .select()
    .single();
  if (!error && data) await logAudit(supabase, user, { action: 'create', entityType: 'evidence', entityId: data.id, afterData: data });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}

export async function removeEvidenceAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const section_id = String(formData.get('section_id'));
  await supabase.from('evidence').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'evidence', entityId: id });
  revalidatePath(`/admin/sections/${section_id}`);
  revalidatePath('/', 'layout');
}
