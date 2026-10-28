# ملف تسليم المشروع — منصة توثيق الشراكة المدرسية

هذا الملف مرجعك الرئيسي لفهم المشروع، تشغيله، نشره، وتطويره لاحقًا (بما في ذلك عبر Gemini).

---

## ⚠️ تنبيه مهم حول طريقة بناء هذا المشروع

كُتب هذا المشروع بالكامل يدويًا، ملفًا بملف، **دون القدرة على تشغيل `npm install` أو `npm run build` فعليًا** — بيئة البناء التي استُخدمت لم يكن لديها اتصال بالإنترنت للوصول إلى سجل الحزم (npm registry). هذا يعني:

- كل ملفات الكود (TypeScript/React/SQL) كُتبت بعناية ومطابقة لتوثيق المكتبات المستخدمة، لكنها **لم تُختبر بالتشغيل الفعلي هنا**.
- أول خطوة يجب أن تقومي بها عند استلام المشروع هي تشغيل `npm install` ثم `npm run build` و`npm run typecheck` محليًا، ومراجعة أي أخطاء تظهر — غالبًا ستكون بسيطة (رقم إصدار حزمة يحتاج تحديثًا، أو خطأ نوع TypeScript طفيف).
- قسم "الاختبارات" أدناه يوضح بالضبط ما تم التحقق منه منطقيًا (قراءة الكود ومطابقته للتوثيق) مقابل ما **لم يُختبر بالتشغيل الفعلي**.

**هذا ليس نموذجًا شكليًا** — كل صفحة ومكوّن وجدول قاعدة بيانات واجراء Server Action مكتوب بالكامل وبمنطق فعلي يطابق المتطلبات، وليس كودًا تجريبيًا أو "placeholder". لكن الأمانة العلمية تقتضي إخباركِ أن خطوة "تثبيت ثم بناء ثم إصلاح ما يظهر" هي خطوة متبقية وضرورية قبل النشر.

---

## 1. بنية المشروع

```
src/
  app/
    layout.tsx               ← Layout جذري (الخطوط + RTL)
    (site)/                  ← الموقع العام
      layout.tsx              ← رأس وتذييل الموقع
      page.tsx                 ← الصفحة الرئيسية
      about/, contact/, evidence/
      indicators/[id]/, indicators/[id]/sections/[sectionId]/
      initiatives/, initiatives/[id]/
    admin/
      login/                   ← تسجيل الدخول (خارج الحماية)
      (dashboard)/             ← كل صفحات لوحة التحكم (محمية بـ requireAdmin)
        site-settings/, administration/, nav/, indicators/, initiatives/,
        media/, reports/, ai/, stats/, design/, settings/, audit-log/
    presentation/              ← وضع العرض أمام لجنة التقييم
    api/admin/
      upload/                   ← رفع الملفات (Route Handler)
      ai/analyze/                ← بدء تحليل PDF (يستدعي Netlify Function)
      ai/generate-report/         ← توليد تقرير ذكي (متزامن)
  components/                  ← مكوّنات React (UI، الصفحة الرئيسية، الملفات، الإدارة)
  lib/
    supabase/                   ← عملاء Supabase (متصفح/خادم/صلاحيات كاملة)
    data/                        ← دوال جلب البيانات (Server-only)
    admin/                        ← حراسة الدخول + سجل التعديلات
    ai/anthropic.ts                ← عميل Anthropic API بسيط (fetch فقط)
    storage.ts, theme.ts, utils.ts, upload-limits.ts
  types/database.ts              ← أنواع TypeScript مطابقة لقاعدة البيانات يدويًا
supabase/
  migrations/0001_init_schema.sql   ← كل الجداول
  migrations/0002_rls_policies.sql   ← سياسات الأمان (RLS)
  STORAGE_SETUP.md                    ← إعداد Storage buckets (يدوي)
netlify/
  functions/analyze-document-background.ts  ← تحليل PDF بالذكاء الاصطناعي (Netlify Background Function)
```

---

## 2. كيفية تشغيل المشروع محليًا

```bash
npm install
cp .env.example .env.local   # ثم عدّلي القيم
npm run dev
```

يفتح على `http://localhost:3000`. لوحة التحكم على `/admin`.

> ميزات الذكاء الاصطناعي (تحليل PDF) تعتمد على Netlify Functions، والتي لا تعمل تلقائيًا مع `next dev` العادي. لتجربتها محليًا، استخدمي `netlify dev` بدلًا من `npm run dev` (يتطلب تثبيت Netlify CLI: `npm install -g netlify-cli` ثم `netlify link` لربط المشروع بموقعك على Netlify).

---

## 3. إعداد Supabase (قاعدة البيانات والتخزين)

### أ. إنشاء المشروع وتنفيذ الـ Migrations

1. أنشئي مشروعًا جديدًا على [app.supabase.com](https://app.supabase.com)
2. من **SQL Editor**، الصقي ونفّذي محتوى `supabase/migrations/0001_init_schema.sql` بالكامل
3. ثم نفّذي `supabase/migrations/0002_rls_policies.sql`
4. اتبعي `supabase/STORAGE_SETUP.md` لإنشاء bucket باسم `media` (خاص) و`public-assets` (عام) وسياساتهما

### ب. إنشاء حساب الإدارة الوحيد

المشروع مصمم لحساب إدارة واحد فقط (بدون حسابات معلمات أخرى حاليًا):

1. من لوحة تحكم Supabase: **Authentication → Users → Add user**
2. أدخلي بريدك الإلكتروني وكلمة مرور قوية
3. **لا تفعّلي** "Send invite email" إن لم يكن هناك SMTP مُعد — فعّلي الحساب مباشرة من نفس الشاشة (Auto-confirm user)
4. استخدمي هذا البريد وكلمة المرور لتسجيل الدخول في `/admin/login`

> **لماذا لا توجد كلمة مرور ثابتة في الكود؟** الطلب الأصلي منع ذلك صراحة لأسباب أمنية. تسجيل الدخول يتم فقط عبر Supabase Auth.

### ج. الحصول على المفاتيح

من **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key (سرّي جدًا) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. تفعيل الذكاء الاصطناعي

1. أنشئي مفتاح API من [console.anthropic.com](https://console.anthropic.com)
2. أضيفيه كمتغير بيئة باسم `ANTHROPIC_API_KEY` في Netlify (Site settings → Environment variables) — **وليس** في أي ملف يصل المتصفح
3. من `/admin/settings`، فعّلي خيار "تفعيل ميزات الذكاء الاصطناعي"

إن لم يُفعَّل، تستمر بقية المنصة بالعمل عادةً، وتظهر رسالة واضحة بدل تنفيذ نتائج وهمية.

---

## 5. النشر على Netlify

1. ارفعي المشروع إلى مستودع GitHub
2. من Netlify: **Add new site → Import an existing project** واختاري المستودع
3. تأكدي أن `npm run build` هو أمر البناء و`.next` هو مجلد النشر (مضبوط مسبقًا في `netlify.toml`)
4. أضيفي متغيرات البيئة كلها (من `.env.example`) في **Site settings → Environment variables**
5. انشري. تحقق Netlify تلقائيًا من `@netlify/plugin-nextjs` لتشغيل Next.js بكل ميزاته (Server Actions، ISR، إلخ)

### ملاحظة حول حدود Netlify

- حجم الطلب الواحد لـ Netlify Functions محدود (عادة ~6MB للطلبات المتزامنة). رفع الملفات الكبيرة (خصوصًا الفيديو) يمر عبر `/api/admin/upload` الذي يعمل كـ Route Handler على Next.js (وليس Netlify Function تقليدية)، لذا الحد الفعلي هو حد حجم الطلب في إعدادات Netlify لموقعك — إن احتجتِ رفع فيديوهات كبيرة جدًا بانتظام، فكّري في رفعها مباشرة عبر Supabase Storage API من المتصفح (يحتاج تعديلًا إضافيًا لاحقًا).
- تحليل PDF بالذكاء الاصطناعي يعمل كـ **Background Function** (اسم الملف ينتهي بـ `-background`)، وله وقت تنفيذ أطول بكثير من الدوال العادية — هذا مقصود لتفادي فشل التحليل بسبب المهلة الزمنية.

---

## 6. كيفية تعديل التصميم

- الألوان، حجم الخط، نمط البطاقات، وترتيب أقسام الصفحة الرئيسية: من `/admin/design` (بدون كود)
- لتعديل الخطوط أو تفاصيل تصميم أعمق: `tailwind.config.ts` و`src/app/globals.css`
- الزخارف البصرية (الموجات، الأشكال الهندسية): `src/components/decor/`

---

## 7. كيفية إضافة وظائف جديدة

المشروع مبني بفصل واضح:
- **عرض البيانات** (Server Components) في `src/app/(site)/` و`src/lib/data/`
- **التعديل** (Server Actions) في ملفات `actions.ts` المجاورة لكل صفحة إدارة
- **قاعدة البيانات**: أضيفي migration جديد في `supabase/migrations/000X_*.sql` بدل تعديل الملفات القديمة
- **الأنواع**: حدّثي `src/types/database.ts` يدويًا، أو (بعد ربط مشروع Supabase فعليًا) ولّديها تلقائيًا بـ:
  ```bash
  npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
  ```

هذا البناء يسهّل على Gemini (أو أي أداة أخرى) متابعة التطوير دون الحاجة لإعادة بناء المشروع.

---

## 8. التعامل مع قاعدة البيانات

- كل الجداول في `supabase/migrations/0001_init_schema.sql` موثقة بتعليقات توضح الغرض من كل جدول
- `evidence_indicators` و`initiative_indicators` و`report_indicators` هي جداول ربط many-to-many (شاهد واحد يمكن ربطه بأكثر من مؤشر، ومبادرة واحدة كذلك)
- `sections.parent_section_id` يسمح بتداخل الأقسام بأي عمق (قسم → قسم فرعي → قسم فرعي فرعي...)
- `content_revisions` يخزّن نسخة سابقة من أي سجل قبل تعديله — لا توجد حاليًا واجهة "استعادة" جاهزة في لوحة التحكم، لكن البيانات محفوظة وجاهزة لإضافة هذه الميزة لاحقًا (استعلام بسيط: `select * from content_revisions where entity_type = '...' and entity_id = '...' order by created_at desc`)

---

## 9. كيفية تشغيل الذكاء الاصطناعي (تقنيًا)

- `src/lib/ai/anthropic.ts`: عميل بسيط يستخدم `fetch` مباشرة (لا حاجة لحزمة SDK كاملة)
- `src/app/api/admin/ai/analyze/route.ts`: ينشئ سجل تحليل معلّق، ثم يستدعي `netlify/functions/analyze-document-background.ts` بشكل غير متزامن (لا ينتظر النتيجة)
- `netlify/functions/analyze-document-background.ts`: يُحمّل ملف PDF، يرسله إلى Claude كمستند (Claude يدعم قراءة PDF مباشرة)، يطلب تصنيفًا بصيغة JSON صارمة، ويحفظ النتيجة
- `src/app/api/admin/ai/generate-report/route.ts`: متزامن (لا يحتاج معالجة خلفية لأنه نص فقط) — يأخذ بيانات مبادرة موجودة فعليًا ويطلب من Claude إعادة صياغتها كتقرير، **مع منع صريح في الـ prompt من اختلاق أي معلومة غير موجودة**

---

## 10. الاختبارات (حسب قائمة الاختبارات المطلوبة في الطلب الأصلي)

| # | الاختبار | الحالة |
|---|----------|--------|
| 1 | ظهور الشعار الأصلي دون تشويه | ✅ منطقيًا — الملف الأصلي محفوظ في `public/logo/` ويُعرض بأبعاده الطبيعية عبر `next/image` بدون أي تعديل |
| 2 | ظهور اسم المدرسة بصورة صحيحة | ✅ منطقيًا — مُدخل كقيمة افتراضية في `site_settings` ومطابق للمستندات المرفقة |
| 3 | عدم وجود صور وهمية أو مولّدة | ✅ — كل الزخارف SVG/CSS مكتوبة بالكود، لا صور فوتوغرافية أو مولّدة بالذكاء الاصطناعي في أي مكان |
| 4 | ظهور الإدارة المدرسية دون صور شخصية | ✅ — بطاقات نصية فقط مع أيقونة عامة |
| 5-6 | فتح المؤشرات والأقسام | ⚠️ غير مُختبر بالتشغيل الفعلي — الكود مكتمل منطقيًا لكن يحتاج تشغيلًا فعليًا للتأكيد |
| 7-9 | إضافة/تعديل قسم، نص، رابط من لوحة الإدارة | ⚠️ غير مُختبر بالتشغيل الفعلي |
| 10-11 | رفع صورة/PDF ومعاينتهما | ⚠️ غير مُختبر بالتشغيل الفعلي |
| 12 | ربط شاهد بمؤشرين | ✅ منطقيًا — جدول `evidence_indicators` وواجهة `/admin/ai` يدعمان هذا، وكذلك يمكن فعله يدويًا عبر الإدارة |
| 13-14 | تسجيل الدخول/الخروج ومنع الزوار من التعديل | ✅ منطقيًا — `requireAdmin()` + RLS طبقتان مستقلتان |
| 15-16 | استمرار البيانات بعد التحديث وإعادة النشر | ✅ — كل البيانات في Supabase (دائمة)، لا شيء في LocalStorage |
| 17 | نتائج فعلية للتحليل الذكي | ✅ منطقيًا — لا توجد بيانات وهمية في الكود؛ يتطلب مفتاح API فعلي للتجربة |
| 18-19 | حفظ تقرير كمسودة وتعديله ونشره | ✅ منطقيًا |
| 20 | عرض صحيح على الهاتف | ⚠️ غير مُختبر بمتصفح فعلي — التصميم مبني بـ Tailwind responsive classes في كل مكوّن |

**الخلاصة:** الكود مكتمل لجميع الميزات العشرين تقريبًا، لكن القسم الأكبر من الاختبارات يتطلب تشغيلًا فعليًا (`npm run dev` بعد `npm install` ناجح، مع مشروع Supabase حقيقي) لم يكن ممكنًا في بيئة الكتابة. **الخطوة التالية الموصى بها فورًا بعد الاستلام:** تشغيل المشروع محليًا والمرور يدويًا على هذه القائمة.

---

## 11. الأجزاء التي تحتاج إعدادًا خارجيًا منك

- [ ] تشغيل `npm install` و`npm run build` ومعالجة أي أخطاء تظهر
- [ ] إنشاء مشروع Supabase وتنفيذ الـ migrations وإعداد Storage
- [ ] إنشاء حساب الإدارة
- [ ] مفتاح Anthropic API (لتفعيل الذكاء الاصطناعي)
- [ ] ربط المستودع بـ Netlify وضبط متغيرات البيئة
- [ ] رفع الصور/الفيديوهات الحقيقية للمدرسة والمبادرات عند توفرها
