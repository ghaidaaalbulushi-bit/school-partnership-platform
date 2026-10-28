'use client';

// المشروع يستخدم React 18.3.1 (وليس 19)، فـ useActionState غير متوفر من 'react'.
// البديل الصحيح في React 18 هو useFormState من 'react-dom'، وحالة "جارٍ الإرسال"
// (pending) تُقرأ عبر useFormStatus من 'react-dom' داخل عنصر ابن لعنصر <form>.
import { useFormState } from 'react-dom';
import { LogIn } from 'lucide-react';
import { loginAction } from './actions';
import { SchoolLogo } from '@/components/SchoolLogo';
import { SubmitButton } from '@/components/admin/forms';

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-cream-50 to-mint-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <SchoolLogo size={64} className="mb-3 rounded-xl" />
          <h1 className="text-lg font-extrabold text-navy-800">لوحة إدارة منصة الشراكة المدرسية</h1>
          <p className="mt-1 text-sm text-navy-500">مدرسة أسماء بنت النعمان (1-8)</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-navy-700">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              dir="ltr"
              className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-navy-700">
              كلمة المرور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              dir="ltr"
              className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {state?.error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{state.error}</p>}

          <SubmitButton
            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
            pendingText="جارٍ الدخول..."
          >
            <LogIn className="h-4 w-4" />
            تسجيل الدخول
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-xs text-navy-400">
          حساب الإدارة الوحيد لهذه المنصة يُنشأ من لوحة تحكم Supabase — راجعي PROJECT_HANDOFF.md
        </p>
      </div>
    </div>
  );
}
