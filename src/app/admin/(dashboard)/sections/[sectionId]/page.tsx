import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Trash2, ExternalLink } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Field, TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import {
  updateSectionAction,
  addRichTextBlockAction,
  deleteBlockAction,
  addLinkAction,
  deleteLinkAction,
  attachEvidenceAction,
  removeEvidenceAction,
} from '@/app/admin/(dashboard)/indicators/[id]/sections/actions';
import { createSectionAction } from '@/app/admin/(dashboard)/indicators/[id]/sections/actions';
import { SectionCard } from '@/components/SectionCard';
import { SectionEvidenceUploader } from '@/components/admin/SectionEvidenceUploader';
import type { SectionRow, SectionBlock, LinkItem, Evidence, MediaFile, Indicator } from '@/types/database';

export default async function AdminSectionDetailPage({ params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: section }, { data: blocks }, { data: links }, { data: evidenceRows }, { data: children }, { data: mediaFiles }] =
    await Promise.all([
      supabase.from('sections').select('*').eq('id', sectionId).single(),
      supabase.from('section_blocks').select('*').eq('section_id', sectionId).order('sort_order'),
      supabase.from('links').select('*').eq('section_id', sectionId).order('sort_order'),
      supabase.from('evidence').select('*, media_file:media_files(*)').eq('section_id', sectionId).order('sort_order'),
      supabase.from('sections').select('*').eq('parent_section_id', sectionId).order('sort_order'),
      supabase.from('media_files').select('*').order('created_at', { ascending: false }).limit(200),
    ]);

  if (!section) notFound();
  const sec = section as SectionRow;
  const { data: indicatorData } = await supabase.from('indicators').select('*').eq('id', sec.indicator_id).single();
  const indicator = indicatorData as Indicator | null;

  return (
    <div className="max-w-4xl space-y-8">
      <nav className="flex items-center gap-1.5 text-sm text-navy-500">
        <Link href={`/admin/indicators/${sec.indicator_id}/sections`} className="hover:text-sky-600">
          أقسام {indicator?.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        <span className="font-semibold text-navy-700">{sec.title}</span>
      </nav>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">بيانات القسم</h2>
        <form action={updateSectionAction} className="space-y-4">
          <input type="hidden" name="id" value={sec.id} />
          <input type="hidden" name="indicator_id" value={sec.indicator_id} />
          <Field label="العنوان">
            <TextInput name="title" defaultValue={sec.title} required />
          </Field>
          <Field label="الوصف">
            <TextArea name="description" defaultValue={sec.description ?? ''} rows={2} />
          </Field>
          <Field label="أيقونة (Lucide)">
            <TextInput name="icon" defaultValue={sec.icon ?? 'FolderOpen'} dir="ltr" className="max-w-xs" />
          </Field>
          <SubmitButton>حفظ</SubmitButton>
        </form>
      </Card>

      {/* Sub-sections */}
      <Card>
        <h2 className="mb-4 font-bold text-navy-800">الأقسام الفرعية</h2>
        {(children as SectionRow[] | null)?.length ? (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {(children as SectionRow[]).map((child) => (
              <SectionCard key={child.id} section={child} href={`/admin/sections/${child.id}`} />
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-navy-500">لا توجد أقسام فرعية بعد.</p>
        )}
        <form action={createSectionAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="indicator_id" value={sec.indicator_id} />
          <input type="hidden" name="parent_section_id" value={sec.id} />
          <TextInput name="title" required placeholder="عنوان القسم الفرعي" className="flex-1" />
          <SubmitButton>إضافة قسم فرعي</SubmitButton>
        </form>
      </Card>

      {/* Content blocks */}
      <Card>
        <h2 className="mb-4 font-bold text-navy-800">المحتوى النصي</h2>
        <div className="mb-4 space-y-3">
          {(blocks as SectionBlock[] | null)?.map((block) => (
            <div key={block.id} className="rounded-xl border border-sky-100 p-4">
              <form action={deleteBlockAction} className="float-left">
                <input type="hidden" name="id" value={block.id} />
                <input type="hidden" name="section_id" value={sec.id} />
                <button type="submit" className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
              <div className="prose-rtl max-w-none text-sm" dangerouslySetInnerHTML={{ __html: block.content.html ?? '' }} />
            </div>
          ))}
        </div>
        <form action={addRichTextBlockAction} className="space-y-3">
          <input type="hidden" name="section_id" value={sec.id} />
          <Field label="فقرة نصية جديدة" hint="يمكن استخدام وسوم HTML بسيطة مثل <b> و <br> و <ul><li>">
            <TextArea name="html" rows={4} placeholder="اكتبي المحتوى هنا..." />
          </Field>
          <SubmitButton>إضافة فقرة</SubmitButton>
        </form>
      </Card>

      {/* Links */}
      <Card>
        <h2 className="mb-4 font-bold text-navy-800">الروابط</h2>
        <div className="mb-4 space-y-2">
          {(links as LinkItem[] | null)?.map((link) => (
            <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 p-3">
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-sky-700">
                {link.title} <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <form action={deleteLinkAction}>
                <input type="hidden" name="id" value={link.id} />
                <input type="hidden" name="section_id" value={sec.id} />
                <button type="submit" className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
          {!(links as LinkItem[] | null)?.length && <p className="text-sm text-navy-500">لا توجد روابط بعد.</p>}
        </div>
        <form action={addLinkAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <input type="hidden" name="section_id" value={sec.id} />
          <TextInput name="title" required placeholder="عنوان الرابط" className="flex-1" />
          <TextInput name="url" required placeholder="https://..." dir="ltr" className="flex-1" />
          <label className="flex items-center gap-1.5 text-sm text-navy-600">
            <input type="checkbox" name="opens_new_tab" defaultChecked /> فتح في صفحة جديدة
          </label>
          <SubmitButton>إضافة</SubmitButton>
        </form>
      </Card>

      {/* Evidence */}
      <Card>
        <h2 className="mb-4 font-bold text-navy-800">الملفات والشواهد</h2>
        <div className="mb-4 space-y-2">
          {(evidenceRows as Evidence[] | null)?.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between gap-3 rounded-xl border border-sky-100 p-3">
              <span className="font-semibold text-navy-700">{ev.title || ev.media_file?.file_name}</span>
              <form action={removeEvidenceAction}>
                <input type="hidden" name="id" value={ev.id} />
                <input type="hidden" name="section_id" value={sec.id} />
                <button type="submit" className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
          {!(evidenceRows as Evidence[] | null)?.length && <p className="text-sm text-navy-500">لا توجد شواهد بعد.</p>}
        </div>

        <SectionEvidenceUploader sectionId={sec.id} />

        <details className="rounded-xl border border-sky-100 p-3">
          <summary className="cursor-pointer text-sm font-bold text-navy-700">
            أو اختاري ملفًا مرفوعًا مسبقًا من مكتبة الملفات
          </summary>
          <form action={attachEvidenceAction} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="section_id" value={sec.id} />
            <div className="flex-1">
              <select name="media_file_id" required className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm">
                <option value="">— اختاري ملفًا —</option>
                {(mediaFiles as MediaFile[] | null)?.map((m) => (
                  <option key={m.id} value={m.id}>{m.file_name}</option>
                ))}
              </select>
            </div>
            <TextInput name="title" placeholder="عنوان الشاهد (اختياري)" className="flex-1" />
            <SubmitButton>إرفاق كشاهد</SubmitButton>
          </form>
          <p className="mt-2 text-xs text-navy-400">
            لإدارة كل الملفات المرفوعة، توجّهي إلى <Link href="/admin/media" className="font-bold text-sky-600 underline">إدارة الملفات</Link>.
          </p>
        </details>
      </Card>
    </div>
  );
}
