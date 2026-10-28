# منصة توثيق الشراكة المدرسية — مدرسة أسماء بنت النعمان (1-8)

منصة Next.js + Supabase + Netlify لتوثيق مؤشرات الشراكة المجتمعية ومبادراتها وشواهدها، مع لوحة تحكم كاملة ومساعد ذكاء اصطناعي لتحليل المستندات وإعداد التقارير.

للتفاصيل الكاملة عن بنية المشروع، كيفية التطوير عليه لاحقًا (بما فيها Gemini)، وكل ما يحتاج إعدادًا خارجيًا، راجعي **`PROJECT_HANDOFF.md`**.

## التقنيات

- **Next.js 14** (App Router, Server Actions, Route Handlers)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (قاعدة بيانات Postgres + Auth + Storage)
- **Netlify** (استضافة + Netlify Functions للذكاء الاصطناعي)
- **Anthropic API (Claude)** لتحليل المستندات وإعداد التقارير (اختياري)

## البدء السريع (تطوير محلي)

> **ملاحظة:** هذا المشروع كُتب يدويًا دون تشغيل `npm install` فعليًا (بيئة البناء لم يكن لديها اتصال بالإنترنت). قبل أول تشغيل، تأكدي من تنفيذ الخطوات التالية بالترتيب ومراجعة أي رسائل خطأ من `npm install` أو `npm run build` — قد تحتاجين تحديث رقم إصدار حزمة واحدة أو اثنتين إذا تغيّرت منذ كتابة هذا الملف.

1. **تثبيت الحزم:**
   ```bash
   npm install
   ```

2. **إعداد Supabase:**
   - أنشئي مشروعًا جديدًا على [supabase.com](https://app.supabase.com)
   - نفّذي ملفات الـ SQL بالترتيب من `supabase/migrations/` (الصقي كل ملف في SQL Editor، أو استخدمي Supabase CLI)
   - اتبعي خطوات `supabase/STORAGE_SETUP.md` لإنشاء وتهيئة الـ Storage buckets
   - أنشئي حساب الإدارة الوحيد (راجعي "إنشاء حساب الإدارة" في `PROJECT_HANDOFF.md`)

3. **متغيرات البيئة:**
   ```bash
   cp .env.example .env.local
   # ثم عدّلي القيم بما يطابق مشروع Supabase الخاص بك
   ```

4. **التشغيل محليًا:**
   ```bash
   npm run dev
   ```
   افتحي http://localhost:3000

5. **فحص الأنواع (TypeScript):**
   ```bash
   npm run typecheck
   ```

## النشر على Netlify

راجعي قسم "النشر على Netlify" في `PROJECT_HANDOFF.md` للخطوات الكاملة.

## هيكل المجلدات (ملخص)

```
src/
  app/
    (site)/          ← الموقع العام (الصفحة الرئيسية، المؤشرات، المبادرات...)
    admin/            ← لوحة التحكم (محمية بتسجيل الدخول)
    presentation/      ← وضع العرض أمام لجنة التقييم
    api/admin/ai/      ← مسارات API لتشغيل ميزات الذكاء الاصطناعي
  components/          ← مكوّنات React المشتركة
  lib/                 ← عملاء Supabase، جلب البيانات، أدوات مساعدة
  types/database.ts    ← أنواع TypeScript مطابقة لقاعدة البيانات
supabase/
  migrations/           ← ملفات SQL لإنشاء قاعدة البيانات (بالترتيب)
  STORAGE_SETUP.md       ← خطوات إعداد Supabase Storage
netlify/
  functions/              ← Netlify Functions (تحليل PDF بالذكاء الاصطناعي)
```
