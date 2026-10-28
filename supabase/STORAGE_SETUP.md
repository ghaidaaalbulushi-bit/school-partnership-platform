# إعداد Supabase Storage

هذه الخطوات يدوية (لوحة تحكم Supabase)، لأن إنشاء الـ buckets وسياساتها عبر SQL أقل موثوقية عبر إصدارات Supabase المختلفة.

## 1) إنشاء Buckets

في **Storage** بلوحة تحكم Supabase، أنشئ bucket باسم:

- `media` — **Private** (غير عام). كل الصور/الفيديوهات/PDF/المستندات المرفوعة من لوحة الإدارة.
- `public-assets` — **Public**. للشعار فقط (وأي صورة واجهة عامة أخرى تقرري نشرها صراحة).

## 2) سياسات bucket "media" (Private)

في تبويب **Policies** لهذا الـ bucket، أضيفي:

**قراءة (SELECT):**
```sql
-- يسمح بالقراءة لأي ملف وُسم كمنشور عبر جدول evidence/media_files
-- (أبسط إعداد عملي: نعتمد على Signed URLs من الخادم بدل سياسة عامة،
-- راجعي src/lib/storage.ts — جميع روابط المعاينة تُولَّد بصلاحية مؤقتة)
create policy "no direct public read"
on storage.objects for select
using (bucket_id = 'media' and auth.role() = 'authenticated');
```

**كتابة (INSERT/UPDATE/DELETE):**
```sql
create policy "admin upload media"
on storage.objects for insert
with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "admin update media"
on storage.objects for update
using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "admin delete media"
on storage.objects for delete
using (bucket_id = 'media' and auth.role() = 'authenticated');
```

> **لماذا لا تكون القراءة عامة؟** لأن الطلب يمنع الاعتماد على "إخفاء الأزرار" فقط لحماية الملفات.
> بدل ذلك، يولّد الخادم (Next.js route handlers) روابط معاينة مؤقتة (Signed URLs، صلاحية محدودة بالدقائق)
> لكل ملف منشور (`status = 'published'`)، فتكون حماية الوصول فعلية على مستوى التخزين لا الواجهة فقط.
> راجعي `src/lib/storage.ts` لمنطق توليد هذه الروابط.

## 3) سياسات bucket "public-assets" (Public)

```sql
create policy "public read public-assets"
on storage.objects for select
using (bucket_id = 'public-assets');

create policy "admin write public-assets"
on storage.objects for insert
with check (bucket_id = 'public-assets' and auth.role() = 'authenticated');

create policy "admin update public-assets"
on storage.objects for update
using (bucket_id = 'public-assets' and auth.role() = 'authenticated');

create policy "admin delete public-assets"
on storage.objects for delete
using (bucket_id = 'public-assets' and auth.role() = 'authenticated');
```

## 4) حدود الحجم

من **Storage → Settings**، فعّلي حد أقصى لحجم الملف (مثلاً 50MB للفيديو، 15MB للصور/PDF) حسب خطة مشروعك على Supabase. حدود إضافية على مستوى التطبيق موجودة في `src/lib/upload-limits.ts`.
