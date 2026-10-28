/** Centralized, app-level file validation — a second gate behind Supabase
 * Storage's own bucket size limit (see supabase/STORAGE_SETUP.md §4). */

export const MAX_FILE_SIZE_BYTES = {
  image: 15 * 1024 * 1024, // 15MB
  video: 200 * 1024 * 1024, // 200MB — large; see README note on Netlify upload limits
  pdf: 25 * 1024 * 1024, // 25MB
  document: 25 * 1024 * 1024, // 25MB
  other: 10 * 1024 * 1024, // 10MB
} as const;

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
  'application/pdf': 'pdf',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
};

export function classifyFile(mimeType: string): keyof typeof MAX_FILE_SIZE_BYTES {
  return (ALLOWED_MIME_TYPES[mimeType] as keyof typeof MAX_FILE_SIZE_BYTES) ?? 'other';
}

export function validateUpload(file: { type: string; size: number }): { ok: true } | { ok: false; reason: string } {
  const fileType = ALLOWED_MIME_TYPES[file.type];
  if (!fileType) {
    return { ok: false, reason: 'نوع الملف غير مسموح به. الأنواع المسموحة: صور (JPG/PNG/WebP)، فيديو (MP4/WebM/MOV)، PDF، Word (DOC/DOCX).' };
  }
  const max = MAX_FILE_SIZE_BYTES[fileType as keyof typeof MAX_FILE_SIZE_BYTES];
  if (file.size > max) {
    return { ok: false, reason: `حجم الملف يتجاوز الحد المسموح (${Math.round(max / (1024 * 1024))}MB).` };
  }
  return { ok: true };
}
