import { FileText, FileType2, Download, File as FileIcon } from 'lucide-react';
import { PdfViewer } from './PdfViewer';
import { ImageGallery, type GalleryImage } from './ImageGallery';
import { VideoPlayer } from './VideoPlayer';
import { getSignedFileUrls } from '@/lib/storage';
import { formatFileSize } from '@/lib/utils';
import type { Evidence } from '@/types/database';

/**
 * Renders a section's evidence items grouped by type: one shared image
 * gallery, then individually-controlled PDF viewers, videos, and Word
 * documents (previewed via their generated PDF copy when available, or a
 * plain download/print row otherwise — their original .docx is always kept
 * intact in storage regardless of whether a preview exists).
 */
export async function EvidenceList({ items }: { items: Evidence[] }) {
  const published = items.filter((e) => e.media_file);

  const urls = await getSignedFileUrls(
    published.flatMap((e) => {
      const f = e.media_file!;
      const list = [{ storage_bucket: f.storage_bucket, storage_path: f.storage_path }];
      if (f.preview_pdf_path) list.push({ storage_bucket: f.storage_bucket, storage_path: f.preview_pdf_path });
      return list;
    })
  );

  const images = published.filter((e) => e.media_file!.file_type === 'image');
  const videos = published.filter((e) => e.media_file!.file_type === 'video');
  const pdfs = published.filter((e) => e.media_file!.file_type === 'pdf');
  const docs = published.filter((e) => e.media_file!.file_type === 'document');
  const others = published.filter((e) => e.media_file!.file_type === 'other');

  if (published.length === 0) {
    return <p className="text-sm text-navy-500/70">لا توجد شواهد مضافة لهذا القسم بعد.</p>;
  }

  const galleryImages: GalleryImage[] = images.map((e) => ({
    url: urls[e.media_file!.storage_path] ?? '',
    alt: e.media_file!.alt_text || e.title || e.media_file!.file_name,
    caption: e.title,
  }));

  return (
    <div className="space-y-8">
      {images.length > 0 && (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-700">
            <FileType2 className="h-4 w-4" /> الصور ({images.length})
          </h4>
          <ImageGallery images={galleryImages} />
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-navy-700">
            <FileType2 className="h-4 w-4" /> الفيديوهات ({videos.length})
          </h4>
          {videos.map((e) => (
            <div key={e.id}>
              {e.title && <p className="mb-1.5 text-sm font-semibold text-navy-700">{e.title}</p>}
              <VideoPlayer src={urls[e.media_file!.storage_path] ?? ''} title={e.title ?? undefined} />
            </div>
          ))}
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-navy-700">
            <FileText className="h-4 w-4" /> ملفات PDF ({pdfs.length})
          </h4>
          {pdfs.map((e) => (
            <div key={e.id}>
              {e.title && <p className="mb-1.5 text-sm font-semibold text-navy-700">{e.title}</p>}
              <PdfViewer
                fileUrl={urls[e.media_file!.storage_path] ?? ''}
                allowDownload={e.allow_download}
                allowPrint={e.allow_print}
                fileName={e.media_file!.file_name}
              />
            </div>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-navy-700">
            <FileText className="h-4 w-4" /> مستندات Word ({docs.length})
          </h4>
          {docs.map((e) => {
            const previewUrl = e.media_file!.preview_pdf_path ? urls[e.media_file!.preview_pdf_path] : null;
            if (previewUrl) {
              return (
                <div key={e.id}>
                  {e.title && <p className="mb-1.5 text-sm font-semibold text-navy-700">{e.title}</p>}
                  <PdfViewer
                    fileUrl={previewUrl}
                    allowDownload={e.allow_download}
                    allowPrint={e.allow_print}
                    fileName={e.media_file!.file_name}
                  />
                </div>
              );
            }
            return (
              <div key={e.id} className="flex items-center justify-between rounded-xl border border-sky-100 bg-white p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-sky-500" />
                  <div>
                    <p className="font-semibold text-navy-700">{e.title || e.media_file!.file_name}</p>
                    <p className="text-xs text-navy-500">{formatFileSize(e.media_file!.file_size_bytes)} — لا تتوفر معاينة مباشرة لهذا الملف</p>
                  </div>
                </div>
                {e.allow_download && (
                  <a
                    href={urls[e.media_file!.storage_path] ?? '#'}
                    download={e.media_file!.file_name}
                    className="rounded-lg bg-sky-50 p-2 text-sky-600 hover:bg-sky-100"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-navy-700">
            <FileIcon className="h-4 w-4" /> ملفات أخرى ({others.length})
          </h4>
          {others.map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-sky-100 bg-white p-4">
              <p className="font-semibold text-navy-700">{e.title || e.media_file!.file_name}</p>
              {e.allow_download && (
                <a href={urls[e.media_file!.storage_path] ?? '#'} download className="rounded-lg bg-sky-50 p-2 text-sky-600 hover:bg-sky-100">
                  <Download className="h-5 w-5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
