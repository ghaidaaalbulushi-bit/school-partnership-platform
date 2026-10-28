'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit } from '@/lib/admin/audit';

export async function createNavItemAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const label = String(formData.get('label') ?? '').trim();
  const href = String(formData.get('href') ?? '').trim();
  if (!label || !href) return;

  const { data: maxRow } = await supabase.from('nav_items').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
  const { data, error } = await supabase
    .from('nav_items')
    .insert({ label, href, sort_order: (maxRow?.sort_order ?? 0) + 1 })
    .select()
    .single();
  if (!error && data) await logAudit(supabase, user, { action: 'create', entityType: 'nav_items', entityId: data.id, afterData: data });
  revalidatePath('/admin/nav');
  revalidatePath('/', 'layout');
}

export async function updateNavItemAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const label = String(formData.get('label') ?? '').trim();
  const href = String(formData.get('href') ?? '').trim();
  await supabase.from('nav_items').update({ label, href }).eq('id', id);
  await logAudit(supabase, user, { action: 'update', entityType: 'nav_items', entityId: id });
  revalidatePath('/admin/nav');
  revalidatePath('/', 'layout');
}

export async function toggleNavVisibilityAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const isVisible = formData.get('is_visible') === 'true';
  await supabase.from('nav_items').update({ is_visible: !isVisible }).eq('id', id);
  await logAudit(supabase, user, { action: 'update', entityType: 'nav_items', entityId: id, afterData: { is_visible: !isVisible } });
  revalidatePath('/admin/nav');
  revalidatePath('/', 'layout');
}

export async function deleteNavItemAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  await supabase.from('nav_items').delete().eq('id', id);
  await logAudit(supabase, user, { action: 'delete', entityType: 'nav_items', entityId: id });
  revalidatePath('/admin/nav');
  revalidatePath('/', 'layout');
}

export async function updateFooterTextAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const footer_text = String(formData.get('footer_text') ?? '');
  const contact_email = String(formData.get('contact_email') ?? '');
  const contact_phone = String(formData.get('contact_phone') ?? '');
  const contact_address = String(formData.get('contact_address') ?? '');
  await supabase.from('site_settings').update({ footer_text, contact_email, contact_phone, contact_address }).eq('id', 1);
  await logAudit(supabase, user, { action: 'update', entityType: 'site_settings', entityId: 'footer' });
  revalidatePath('/admin/nav');
  revalidatePath('/', 'layout');
}
