import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { requireAdmin } from '@/lib/admin/guard';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { validateUpload, classifyFile } from '@/lib/upload-limits';
import { logAudit } from '@/lib/admin/audit';

export const runtime = 'nodejs';

/**
 * Upload a file (PDF, image, video, Word doc — see src/lib/upload-limits.ts)
 * directly from a section page and attach it as evidence to that section in
 * one step. This is the one-click counterpart to the Media Library upload +
 * "attach a previously uploaded file" flow on the section page — it still
 * writes to the same `media_files` / `evidence` tables, just in one request.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const { user, supabase } = await requireAdmin();

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const title = String(formData.get('title') ?? '').trim() || null;
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

  const { data: mediaFile, error: mediaError } = await supabase
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

  if (mediaError || !mediaFile) {
    await service.storage.from('media').remove([storagePath]);
    return NextResponse.json({ error: `تعذّر حفظ بيانات الملف: ${mediaError?.message}` }, { status: 500 });
  }

  const { data: evidence, error: evidenceError } = await supabase
    .from('evidence')
    .insert({ section_id: sectionId, media_file_id: mediaFile.id, title, status: 'published' })
    .select('*, media_file:media_files(*)')
    .single();

  if (evidenceError || !evidence) {
    // Keep the uploaded media_files row (it's valid, just not attached here
    // yet) rather than deleting it — the admin can still attach it manually
    // from the "ملف مرفوع مسبقًا" picker.
    return NextResponse.json({ error: `تعذّر إرفاق الملف كشاهد: ${evidenceError?.message}` }, { status: 500 });
  }

  await logAudit(supabase, user, { action: 'create', entityType: 'media_files', entityId: mediaFile.id, afterData: mediaFile });
  await logAudit(supabase, user, { action: 'create', entityType: 'evidence', entityId: evidence.id, afterData: evidence });

  return NextResponse.json({ evidence });
}
