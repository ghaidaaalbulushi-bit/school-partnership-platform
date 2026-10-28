'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit, snapshotRevision } from '@/lib/admin/audit';

export async function createIndicatorAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const standard_name = String(formData.get('standard_name') ?? '').trim() || title;
  const description = String(formData.get('description') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim() || null;
  if (!title || !description) return;

  const { data: maxRow } = await supabase
    .from('indicators')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('indicators')
    .insert({ title, standard_name, description, code, sort_order: (maxRow?.sort_order ?? 0) + 1, status: 'draft' })
    .select()
    .single();

  if (!error && data) {
    await logAudit(supabase, user, { action: 'create', entityType: 'indicators', entityId: data.id, afterData: data });
  }
  revalidatePath('/admin/indicators');
}

export async function updateIndicatorAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const update = {
    code: String(formData.get('code') ?? '').trim() || null,
    standard_name: String(formData.get('standard_name') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    icon: String(formData.get('icon') ?? 'Users'),
    color_theme: String(formData.get('color_theme') ?? 'sky'),
  };

  const { data: before } = await supabase.from('indicators').select('*').eq('id', id).single();
  const { error } = await supabase.from('indicators').update(update).eq('id', id);
  if (!error) {
    if (before) await snapshotRevision(supabase, user, 'indicators', id, before);
    await logAudit(supabase, user, { action: 'update', entityType: 'indicators', entityId: id, beforeData: before, afterData: update });
  }
  revalidatePath('/admin/indicators');
  revalidatePath(`/admin/indicators/${id}`);
  revalidatePath('/', 'layout');
}

export async function togglePublishIndicatorAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const current = String(formData.get('status'));
  const next = current === 'published' ? 'draft' : 'published';
  await supabase.from('indicators').update({ status: next }).eq('id', id);
  await logAudit(supabase, user, { action: next === 'published' ? 'publish' : 'unpublish', entityType: 'indicators', entityId: id });
  revalidatePath('/admin/indicators');
  revalidatePath('/', 'layout');
}

export async function deleteIndicatorAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const { data: before } = await supabase.from('indicators').select('*').eq('id', id).single();
  await supabase.from('indicators').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'indicators', entityId: id, beforeData: before });
  revalidatePath('/admin/indicators');
  revalidatePath('/', 'layout');
}

export async function reorderIndicatorAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const direction = String(formData.get('direction')); // 'up' | 'down'

  const { data: all } = await supabase.from('indicators').select('id, sort_order').order('sort_order');
  if (!all) return;
  const idx = all.findIndex((r) => r.id === id);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return;

  const a = all[idx]!;
  const b = all[swapIdx]!;
  await supabase.from('indicators').update({ sort_order: b.sort_order }).eq('id', a.id);
  await supabase.from('indicators').update({ sort_order: a.sort_order }).eq('id', b.id);

  revalidatePath('/admin/indicators');
  revalidatePath('/', 'layout');
}
