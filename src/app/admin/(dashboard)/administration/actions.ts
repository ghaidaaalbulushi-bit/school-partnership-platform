'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit, snapshotRevision } from '@/lib/admin/audit';

export async function createRoleAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const full_name = String(formData.get('full_name') ?? '').trim();
  const job_title = String(formData.get('job_title') ?? '').trim();
  const icon = String(formData.get('icon') ?? 'UserRound');
  if (!full_name || !job_title) return;

  const { data: maxRow } = await supabase.from('admin_roles').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
  const sort_order = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase.from('admin_roles').insert({ full_name, job_title, icon, sort_order }).select().single();
  if (!error && data) {
    await logAudit(supabase, user, { action: 'create', entityType: 'admin_roles', entityId: data.id, afterData: data });
  }
  revalidatePath('/admin/administration');
  revalidatePath('/', 'layout');
}

export async function updateRoleAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const full_name = String(formData.get('full_name') ?? '').trim();
  const job_title = String(formData.get('job_title') ?? '').trim();

  const { data: before } = await supabase.from('admin_roles').select('*').eq('id', id).single();
  const { error } = await supabase.from('admin_roles').update({ full_name, job_title }).eq('id', id);
  if (!error) {
    if (before) await snapshotRevision(supabase, user, 'admin_roles', id, before);
    await logAudit(supabase, user, { action: 'update', entityType: 'admin_roles', entityId: id, beforeData: before });
  }
  revalidatePath('/admin/administration');
  revalidatePath('/', 'layout');
}

export async function toggleRoleVisibilityAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const isVisible = formData.get('is_visible') === 'true';
  await supabase.from('admin_roles').update({ is_visible: !isVisible }).eq('id', id);
  await logAudit(supabase, user, { action: 'update', entityType: 'admin_roles', entityId: id, afterData: { is_visible: !isVisible } });
  revalidatePath('/admin/administration');
  revalidatePath('/', 'layout');
}

export async function deleteRoleAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const { data: before } = await supabase.from('admin_roles').select('*').eq('id', id).single();
  await supabase.from('admin_roles').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'admin_roles', entityId: id, beforeData: before });
  revalidatePath('/admin/administration');
  revalidatePath('/', 'layout');
}
