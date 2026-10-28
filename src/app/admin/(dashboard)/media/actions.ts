'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/guard';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/admin/audit';

export async function deleteMediaFileAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get('id'));

  const { data: file } = await supabase.from('media_files').select('*').eq('id', id).single();
  if (!file) return;

  const service = createServiceRoleClient();
  const paths = [file.storage_path, file.preview_pdf_path].filter(Boolean) as string[];
  await service.storage.from(file.storage_bucket).remove(paths);

  await supabase.from('media_files').delete().eq('id', id); // cascades to evidence rows referencing it
  await logAudit(supabase, user, { action: 'delete', entityType: 'media_files', entityId: id, beforeData: file });

  revalidatePath('/admin/media');
}
