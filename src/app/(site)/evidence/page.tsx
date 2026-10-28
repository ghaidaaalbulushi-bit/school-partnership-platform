import Link from 'next/link';
import { FileText, Image as ImageIcon, Video, File as FileIcon } from 'lucide-react';
import { getAllPublishedEvidence } from '@/lib/data/evidence';
import { formatFileSize } from '@/lib/utils';

export const revalidate = 60;

const TYPE_ICON: Record<string, any> = { image: ImageIcon, video: Video, pdf: FileText, document: FileText, other: FileIcon };
const TYPE_LABEL: Record<string, string> = { image: 'صورة', video: 'فيديو', pdf: 'PDF', document: 'مستند', other: 'ملف' };

export default async function EvidencePage() {
  const evidence = await getAllPublishedEvidence();

  const grouped = evidence.reduce<Record<string, typeof evidence>>((acc, e) => {
    const key = e.indicator_title ?? 'غير مصنّف';
    (acc[key] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-3xl font-extrabold text-navy-800">الشواهد والأدلة</h1>
        <p className="mx-auto max-w-2xl text-navy-700/70">
          فهرس شامل لكل الشواهد الموثّقة في المنصة — اضغطي على أي شاهد للانتقال إلى قسمه ومعاينته
        </p>
      </div>

      {evidence.length === 0 ? (
        <p className="text-center text-navy-600/70">لا توجد شواهد منشورة بعد.</p>
      ) : (
        Object.entries(grouped).map(([indicatorTitle, items]) => (
          <div key={indicatorTitle} className="mb-10">
            <h2 className="mb-4 text-lg font-extrabold text-navy-800">{indicatorTitle}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((e) => {
                const Icon = TYPE_ICON[e.media_file!.file_type] ?? FileIcon;
                const href = e.section_id && e.indicator_id ? `/indicators/${e.indicator_id}/sections/${e.section_id}` : '/evidence';
                return (
                  <Link
                    key={e.id}
                    href={href}
                    className="flex items-center gap-3 rounded-xl border border-sky-100 bg-white p-4 transition hover:border-sky-300 hover:shadow-soft"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-navy-700">
                        {e.title || e.media_file!.file_name}
                      </span>
                      <span className="block text-xs text-navy-500">
                        {TYPE_LABEL[e.media_file!.file_type]} · {formatFileSize(e.media_file!.file_size_bytes)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
