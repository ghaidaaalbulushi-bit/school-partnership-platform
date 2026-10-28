import { FileText, Image as ImageIcon, Video, File as FileIcon, Trash2 } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { MediaUploader } from '@/components/admin/MediaUploader';
import { AnalyzeButton } from '@/components/admin/AnalyzeButton';
import { deleteMediaFileAction } from './actions';
import { formatFileSize, formatArabicDate } from '@/lib/utils';
import type { MediaFile } from '@/types/database';

const TYPE_ICON: Record<string, any> = { image: ImageIcon, video: Video, pdf: FileText, document: FileText, other: FileIcon };

export default async function AdminMediaPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('media_files').select('*').order('created_at', { ascending: false });
  const files = (data as MediaFile[]) ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">الصور والفيديوهات والملفات</h1>
      <p className="mb-6 text-sm text-navy-500">
        ارفعي الملفات هنا أولًا، ثم أرفقيها كشواهد لأي قسم من صفحة إدارة ذلك القسم.
      </p>

      <Card className="mb-8">
        <MediaUploader />
      </Card>

      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-center text-navy-500">لم تُرفع أي ملفات بعد.</p>
        ) : (
          files.map((file) => {
            const Icon = TYPE_ICON[file.file_type] ?? FileIcon;
            return (
              <Card key={file.id} className="flex flex-wrap items-center justify-between gap-3 !p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-navy-700">{file.file_name}</p>
                    <p className="text-xs text-navy-500">
                      {formatFileSize(file.file_size_bytes)} · {formatArabicDate(file.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {file.file_type === 'pdf' && <AnalyzeButton mediaFileId={file.id} />}
                  <form action={deleteMediaFileAction}>
                    <input type="hidden" name="id" value={file.id} />
                    <button type="submit" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
