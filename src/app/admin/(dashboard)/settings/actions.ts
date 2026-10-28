'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/admin/audit';

export async function updateToggleSettingsAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const update = {
    ai_enabled: formData.get('ai_enabled') === 'on',
    file_download_enabled: formData.get('file_download_enabled') === 'on',
    file_print_enabled: formData.get('file_print_enabled') === 'on',
    presentation_mode_enabled: formData.get('presentation_mode_enabled') === 'on',
  };
  await supabase.from('site_settings').update(update).eq('id', 1);
  await logAudit(supabase, user, { action: 'update', entityType: 'site_settings', entityId: 'toggles', afterData: update });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}

export async function uploadLogoAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const file = formData.get('logo') as File | null;
  if (!file || file.size === 0) return;

  const service = createServiceRoleClient();
  const ext = file.name.split('.').pop() || 'png';
  const path = `logo-${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await service.storage.from('public-assets').upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return;

  const publicUrl = service.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
  await supabase.from('site_settings').update({ logo_storage_path: publicUrl }).eq('id', 1);
  await logAudit(supabase, user, { action: 'update', entityType: 'site_settings', entityId: 'logo' });

  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings');
}
