'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { logAudit, snapshotRevision } from '@/lib/admin/audit';
import type { SiteSettings } from '@/types/database';

const EDITABLE_FIELDS = [
  'school_name',
  'platform_name',
  'principal_name',
  'principal_title',
  'vice_principal_name',
  'vice_principal_title',
  'vision_text',
  'mission_text',
  'hero_title',
  'hero_subtitle',
  'hero_tagline',
  'hero_cta_primary_label',
  'hero_cta_primary_href',
  'hero_cta_secondary_label',
  'hero_cta_secondary_href',
] as const satisfies readonly (keyof SiteSettings)[];

export async function updateSiteSettingsAction(
  prevState: { message?: string; error?: string } | undefined,
  formData: FormData
) {
  const { user, supabase } = await requireAdmin();

  const { data: before } = await supabase.from('site_settings').select('*').eq('id', 1).single();

  const update: Record<string, string> = {};
  for (const field of EDITABLE_FIELDS) {
    const value = formData.get(field);
    if (value !== null) update[field] = String(value);
  }

  const { error } = await supabase.from('site_settings').update(update).eq('id', 1);
  if (error) return { error: `تعذّر الحفظ: ${error.message}` };

  if (before) await snapshotRevision(supabase, user, 'site_settings', 'site_settings', before);
  await logAudit(supabase, user, {
    action: 'update',
    entityType: 'site_settings',
    entityId: 'site_settings',
    beforeData: before,
    afterData: update,
  });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/site-settings');
  return { message: 'تم حفظ التغييرات بنجاح.' };
}
