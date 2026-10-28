import { ArrowUp, ArrowDown } from 'lucide-react';
import { getThemeSettings } from '@/lib/data/site';
import { Card } from '@/components/ui/Card';
import { Field, SubmitButton } from '@/components/admin/forms';
import { updateThemeAction, reorderHomeSectionAction } from './actions';

const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: 'sky500', label: 'أزرق سماوي' },
  { key: 'navy700', label: 'كحلي' },
  { key: 'cream50', label: 'بيج كريمي (الخلفية)' },
  { key: 'mint500', label: 'أخضر نعناعي' },
  { key: 'gold500', label: 'ذهبي' },
  { key: 'peach300', label: 'خوخي' },
  { key: 'rose300', label: 'وردي' },
];

const SECTION_LABELS: Record<string, string> = {
  hero: 'الترحيب (Hero)',
  vision_mission: 'الرؤية والرسالة',
  administration: 'الإدارة المدرسية',
  indicators: 'المؤشرات والمعايير',
  initiatives_preview: 'أحدث المبادرات',
  cta: 'دعوة ختامية',
};

export default async function AdminDesignPage() {
  const theme = await getThemeSettings();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-extrabold text-navy-800">إعدادات التصميم</h1>
        <p className="text-sm text-navy-500">تحكّمي بألوان الموقع وحجم الخط ونمط البطاقات وترتيب أقسام الصفحة الرئيسية.</p>
      </div>

      <Card>
        <h2 className="mb-4 font-bold text-navy-800">ترتيب وإظهار أقسام الصفحة الرئيسية</h2>
        <div className="space-y-2">
          {theme.home_sections_order.map((key, i) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-sky-100 p-3">
              <span className="font-semibold text-navy-700">{SECTION_LABELS[key] ?? key}</span>
              <div className="flex items-center gap-2">
                <form action={reorderHomeSectionAction}>
                  <input type="hidden" name="key" value={key} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} className="rounded-lg p-1.5 text-navy-400 hover:bg-sky-50 disabled:opacity-30">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </form>
                <form action={reorderHomeSectionAction}>
                  <input type="hidden" name="key" value={key} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={i === theme.home_sections_order.length - 1} className="rounded-lg p-1.5 text-navy-400 hover:bg-sky-50 disabled:opacity-30">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <form action={updateThemeAction} className="space-y-6">
          <div>
            <h2 className="mb-4 font-bold text-navy-800">الألوان</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {COLOR_FIELDS.map((c) => (
                <Field key={c.key} label={c.label}>
                  <input
                    type="color"
                    name={`color_${c.key}`}
                    defaultValue={theme.colors[c.key] ?? '#0ea5e9'}
                    className="h-11 w-full cursor-pointer rounded-xl border border-sky-200"
                  />
                </Field>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="حجم الخط">
              <select name="font_scale" defaultValue={theme.font_scale} className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm">
                <option value="sm">صغير</option>
                <option value="md">متوسط (افتراضي)</option>
                <option value="lg">كبير</option>
              </select>
            </Field>
            <Field label="نمط البطاقات">
              <select name="card_style" defaultValue={theme.card_style} className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm">
                <option value="rounded-soft">حواف ناعمة (افتراضي)</option>
                <option value="rounded-sharp">حواف بسيطة</option>
                <option value="flat">بدون انحناء</option>
              </select>
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-navy-700">
            <input type="checkbox" name="reduced_motion_respect" defaultChecked={theme.reduced_motion_respect} />
            احترام إعدادات تقليل الحركة في المتصفح
          </label>

          {theme.home_sections_order.map((key) => (
            <input key={key} type="hidden" name="section_order" value={key} />
          ))}
          {theme.home_sections_order.map((key) => (
            <label key={`v-${key}`} className="flex items-center gap-2 text-sm text-navy-600">
              <input type="checkbox" name={`visible_${key}`} defaultChecked={theme.home_sections_visibility[key] !== false} />
              إظهار قسم: {SECTION_LABELS[key] ?? key}
            </label>
          ))}

          <SubmitButton>حفظ إعدادات التصميم</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
