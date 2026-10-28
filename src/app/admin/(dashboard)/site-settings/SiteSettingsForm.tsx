'use client';

import { useActionState } from 'react';
import { updateSiteSettingsAction } from './actions';
import { Field, TextInput, TextArea, SubmitButton, FormMessage } from '@/components/admin/forms';
import { Card } from '@/components/ui/Card';
import type { SiteSettings } from '@/types/database';

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(updateSiteSettingsAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage message={state?.message} variant="success" />
      <FormMessage message={state?.error} variant="error" />

      <Card>
        <h2 className="mb-4 text-lg font-extrabold text-navy-800">بيانات المدرسة</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المدرسة">
            <TextInput name="school_name" defaultValue={settings.school_name} required />
          </Field>
          <Field label="اسم المنصة">
            <TextInput name="platform_name" defaultValue={settings.platform_name} required />
          </Field>
          <Field label="اسم المديرة">
            <TextInput name="principal_name" defaultValue={settings.principal_name} />
          </Field>
          <Field label="المسمى الوظيفي للمديرة">
            <TextInput name="principal_title" defaultValue={settings.principal_title} />
          </Field>
          <Field label="اسم مساعدة المديرة">
            <TextInput name="vice_principal_name" defaultValue={settings.vice_principal_name} />
          </Field>
          <Field label="المسمى الوظيفي لمساعدة المديرة">
            <TextInput name="vice_principal_title" defaultValue={settings.vice_principal_title} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-extrabold text-navy-800">الرؤية والرسالة</h2>
        <div className="space-y-4">
          <Field label="رؤية المدرسة">
            <TextArea name="vision_text" defaultValue={settings.vision_text} rows={3} />
          </Field>
          <Field label="رسالة المدرسة">
            <TextArea name="mission_text" defaultValue={settings.mission_text} rows={4} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-extrabold text-navy-800">القسم الترحيبي (Hero) في الصفحة الرئيسية</h2>
        <div className="grid gap-4">
          <Field label="العنوان الرئيسي">
            <TextInput name="hero_title" defaultValue={settings.hero_title} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="العنوان الفرعي">
              <TextInput name="hero_subtitle" defaultValue={settings.hero_subtitle} />
            </Field>
            <Field label="العبارة التعريفية">
              <TextInput name="hero_tagline" defaultValue={settings.hero_tagline} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نص الزر الأول">
              <TextInput name="hero_cta_primary_label" defaultValue={settings.hero_cta_primary_label} />
            </Field>
            <Field label="رابط الزر الأول">
              <TextInput name="hero_cta_primary_href" defaultValue={settings.hero_cta_primary_href} dir="ltr" />
            </Field>
            <Field label="نص الزر الثاني">
              <TextInput name="hero_cta_secondary_label" defaultValue={settings.hero_cta_secondary_label} />
            </Field>
            <Field label="رابط الزر الثاني">
              <TextInput name="hero_cta_secondary_href" defaultValue={settings.hero_cta_secondary_href} dir="ltr" />
            </Field>
          </div>
        </div>
      </Card>

      <SubmitButton>حفظ جميع التغييرات</SubmitButton>
    </form>
  );
}
