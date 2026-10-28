import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAdminSectionTree } from '@/lib/data/admin-sections';
import { Card } from '@/components/ui/Card';
import { TextInput, TextArea, SubmitButton } from '@/components/admin/forms';
import { SectionTreeRow } from '@/components/admin/SectionTreeRow';
import { createSectionAction } from './actions';
import type { Indicator, SectionTreeNode } from '@/types/database';

function flattenForSelect(nodes: SectionTreeNode[], depth = 0): { id: string; label: string }[] {
  return nodes.flatMap((n) => [
    { id: n.id, label: `${'— '.repeat(depth)}${n.title}` },
    ...flattenForSelect(n.children, depth + 1),
  ]);
}

export default async function AdminIndicatorSectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: indicatorData } = await supabase.from('indicators').select('*').eq('id', id).single();
  const indicator = indicatorData as Indicator | null;
  if (!indicator) notFound();

  const tree = await getAdminSectionTree(id);
  const flatOptions = flattenForSelect(tree);

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-extrabold text-navy-800">أقسام مؤشر: {indicator.title}</h1>
      <p className="mb-6 text-sm text-navy-500">
        يمكن إنشاء أقسام رئيسية وأقسام فرعية بأي عمق. اضغطي "إدارة" لإضافة المحتوى والملفات والروابط لأي قسم.
      </p>

      <div className="mb-8 space-y-2">
        {tree.length === 0 ? (
          <p className="text-navy-500">لا توجد أقسام بعد. أضيفي أول قسم أدناه.</p>
        ) : (
          tree.map((section, i) => (
            <SectionTreeRow key={section.id} section={section} indicatorId={id} isFirst={i === 0} isLast={i === tree.length - 1} />
          ))
        )}
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">إضافة قسم جديد</h2>
        <form action={createSectionAction} className="space-y-4">
          <input type="hidden" name="indicator_id" value={id} />
          <div>
            <label className="mb-1.5 block text-sm font-bold text-navy-700">القسم الأب (اختياري — اتركيه فارغًا لإنشاء قسم رئيسي)</label>
            <select name="parent_section_id" className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm">
              <option value="">— بدون (قسم رئيسي) —</option>
              {flatOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <TextInput name="title" required placeholder="عنوان القسم" />
          <TextArea name="description" placeholder="وصف مختصر (اختياري)" rows={2} />
          <SubmitButton>إضافة القسم</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
