import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { requireAdmin } from '@/lib/admin/guard';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { validateUpload, classifyFile } from '@/lib/upload-limits';
import { logAudit } from '@/lib/admin/audit';

export const runtime = 'nodejs';

/**
 * Handles file upload from the admin media library. Runs server-side so the
 * service-role key never reaches the browser; the admin-only guard below is
 * the actual authorization check (the `media` bucket itself denies direct
 * anonymous writes too, per supabase/STORAGE_SETUP.md, as defense in depth).
 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await requireAdmin();

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'لم يتم إرفاق ملف.' }, { status: 400 });
  }

  const validation = validateUpload({ type: file.type, size: file.size });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const fileType = classifyFile(file.type);
  const ext = file.name.split('.').pop() || 'bin';
  const storagePath = `${fileType}/${nanoid()}.${ext}`;

  const service = createServiceRoleClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await service.storage
    .from('media')
    .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: `تعذّر رفع الملف: ${uploadError.message}` }, { status: 500 });
  }

  const { data: mediaFile, error: dbError } = await supabase
    .from('media_files')
    .insert({
      file_name: file.name,
      storage_bucket: 'media',
      storage_path: storagePath,
      mime_type: file.type,
      file_type: fileType,
      file_size_bytes: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    // Roll back the orphaned storage object so it doesn't linger unreferenced.
    await service.storage.from('media').remove([storagePath]);
    return NextResponse.json({ error: `تعذّر حفظ بيانات الملف: ${dbError.message}` }, { status: 500 });
  }

  await logAudit(supabase, user, { action: 'create', entityType: 'media_files', entityId: mediaFile.id, afterData: mediaFile });

  return NextResponse.json({ mediaFile });
}
