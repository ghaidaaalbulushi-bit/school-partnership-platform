'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit } from '@/lib/admin/audit';

const COLOR_KEYS = ['sky500', 'sky400', 'sky600', 'navy700', 'navy800', 'cream50', 'mint500', 'gold500', 'peach300', 'rose300'];

export async function updateThemeAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const colors: Record<string, string> = {};
  for (const key of COLOR_KEYS) {
    const value = formData.get(`color_${key}`);
    if (value) colors[key] = String(value);
  }

  const font_scale = String(formData.get('font_scale') ?? 'md');
  const card_style = String(formData.get('card_style') ?? 'rounded-soft');
  const reduced_motion_respect = formData.get('reduced_motion_respect') === 'on';

  const sectionsOrder = formData.getAll('section_order').map(String);
  const sectionsVisibility: Record<string, boolean> = {};
  for (const key of sectionsOrder) {
    sectionsVisibility[key] = formData.get(`visible_${key}`) === 'on';
  }

  const { error } = await supabase
    .from('theme_settings')
    .update({
      colors,
      font_scale,
      card_style,
      reduced_motion_respect,
      home_sections_order: sectionsOrder,
      home_sections_visibility: sectionsVisibility,
    })
    .eq('id', 1);

  if (!error) await logAudit(supabase, user, { action: 'update', entityType: 'theme_settings', entityId: 'theme_settings' });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/design');
}

export async function reorderHomeSectionAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const key = String(formData.get('key'));
  const direction = String(formData.get('direction'));

  const { data: theme } = await supabase.from('theme_settings').select('home_sections_order').eq('id', 1).single();
  if (!theme) return;
  const order = [...(theme.home_sections_order as string[])];
  const idx = order.indexOf(key);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= order.length) return;
  [order[idx], order[swapIdx]] = [order[swapIdx]!, order[idx]!];

  await supabase.from('theme_settings').update({ home_sections_order: order }).eq('id', 1);
  revalidatePath('/', 'layout');
  revalidatePath('/admin/design');
}
