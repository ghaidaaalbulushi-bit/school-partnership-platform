import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Calendar, MapPin, Users, Target, ExternalLink } from 'lucide-react';
import { getInitiativeById } from '@/lib/data/initiatives';
import { getPublishedIndicators } from '@/lib/data/indicators';
import { Card } from '@/components/ui/Card';
import { ImageGallery } from '@/components/files/ImageGallery';
import { VideoPlayer } from '@/components/files/VideoPlayer';
import { PdfViewer } from '@/components/files/PdfViewer';
import { getSignedFileUrls } from '@/lib/storage';
import { formatArabicDate } from '@/lib/utils';

export const revalidate = 60;

const FIELD_LABELS: { key: keyof NonNullable<Awaited<ReturnType<typeof getInitiativeById>>>; label: string }[] = [
  { key: 'goals', label: 'الأهداف' },
  { key: 'execution_mechanism', label: 'آلية التنفيذ' },
  { key: 'results', label: 'النتائج' },
  { key: 'impact_measurement', label: 'قياس الأثر ومدى الانتشار' },
  { key: 'recommendations', label: 'التوصيات' },
];

export default async function InitiativeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [initiative, allIndicators] = await Promise.all([getInitiativeById(id), getPublishedIndicators()]);
  if (!initiative) notFound();

  const linkedIndicators = allIndicators.filter((i) => initiative.indicator_ids?.includes(i.id));
  const media = initiative.media ?? [];
  const images = media.filter((m) => m.file_type === 'image');
  const videos = media.filter((m) => m.file_type === 'video');
  const pdfs = media.filter((m) => m.file_type === 'pdf');

  const urls = await getSignedFileUrls(media.map((m) => ({ storage_bucket: m.storage_bucket, storage_path: m.storage_path })));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-navy-500">
        <Link href="/initiatives" className="hover:text-sky-600">المبادرات والفعاليات</Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-semibold text-navy-700">{initiative.title}</span>
      </nav>

      <h1 className="mb-4 text-2xl font-extrabold text-navy-800 md:text-3xl">{initiative.title}</h1>

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-navy-600">
        {initiative.execution_date && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-sky-500" /> {formatArabicDate(initiative.execution_date)}
          </span>
        )}
        {initiative.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-sky-500" /> {initiative.location}
          </span>
        )}
        {initiative.target_group && (
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-sky-500" /> {initiative.target_group}
          </span>
        )}
      </div>

      {linkedIndicators.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {linkedIndicators.map((ind) => (
            <Link
              key={ind.id}
              href={`/indicators/${ind.id}`}
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700 hover:bg-sky-200"
            >
              {ind.title}
            </Link>
          ))}
        </div>
      )}

      {initiative.description && (
        <p className="mb-8 leading-relaxed text-navy-700/85">{initiative.description}</p>
      )}

      {initiative.participating_parties && (
        <Card className="mb-6">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-navy-800">
            <Users className="h-4 w-4 text-sky-500" /> الجهات المشاركة
          </h3>
          <p className="text-sm leading-relaxed text-navy-700/80">{initiative.participating_parties}</p>
        </Card>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {FIELD_LABELS.map(({ key, label }) => {
          const value = initiative[key];
          if (!value) return null;
          return (
            <Card key={key}>
              <h3 className="mb-2 flex items-center gap-2 font-bold text-navy-800">
                <Target className="h-4 w-4 text-sky-500" /> {label}
              </h3>
              <p className="text-sm leading-relaxed text-navy-700/80">{String(value)}</p>
            </Card>
          );
        })}
      </div>

      {images.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-extrabold text-navy-800">الصور</h2>
          <ImageGallery
            images={images.map((m) => ({ url: urls[m.storage_path] ?? '', alt: m.alt_text || m.file_name }))}
          />
        </div>
      )}

      {videos.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-extrabold text-navy-800">الفيديوهات</h2>
          {videos.map((v) => (
            <VideoPlayer key={v.id} src={urls[v.storage_path] ?? ''} title={v.file_name} />
          ))}
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-extrabold text-navy-800">الملفات</h2>
          {pdfs.map((p) => (
            <PdfViewer key={p.id} fileUrl={urls[p.storage_path] ?? ''} fileName={p.file_name} />
          ))}
        </div>
      )}

      {initiative.links && initiative.links.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-extrabold text-navy-800">روابط ذات صلة</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {initiative.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white p-4 hover:border-sky-300"
              >
                <span className="font-semibold text-navy-700">{link.title}</span>
                <ExternalLink className="h-4 w-4 text-navy-300" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
