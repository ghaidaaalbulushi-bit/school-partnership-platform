'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, Loader2 } from 'lucide-react';

/**
 * Drag-and-drop / click-to-upload control embedded directly in a section
 * page. Unlike the central Media Library uploader, this one both uploads
 * the file AND attaches it as evidence to this section in a single request
 * (see /api/admin/sections/[sectionId]/evidence-upload), so there's no need
 * to visit the Media Library first.
 */
export function SectionEvidenceUploader({ sectionId }: { sectionId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`/api/admin/sections/${sectionId}/evidence-upload`, { method: 'POST', body: formData });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error || `تعذّر رفع الملف: ${file.name}`);
        }
      } catch {
        setError(`تعذّر الاتصال بالخادم لرفع: ${file.name}`);
      }
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <div className="mb-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/50 p-6 text-center transition hover:bg-sky-50"
      >
        {uploading ? <Loader2 className="h-6 w-6 animate-spin text-sky-500" /> : <FileUp className="h-6 w-6 text-sky-400" />}
        <p className="text-sm font-bold text-navy-700">
          {uploading ? 'جارٍ الرفع...' : 'اسحبي ملف PDF (أو صورة/فيديو/Word) هنا أو اضغطي للاختيار'}
        </p>
        <p className="text-xs text-navy-400">سيُرفق تلقائيًا كشاهد لهذا القسم</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.doc,.docx"
        />
      </div>
      {error && <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{error}</p>}
    </div>
  );
}
