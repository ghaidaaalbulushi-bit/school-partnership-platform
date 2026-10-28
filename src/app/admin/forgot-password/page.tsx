'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SchoolLogo } from '@/components/SchoolLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (resetError) {
      setError('تعذّر إرسال رابط إعادة التعيين. حاولي مرة أخرى لاحقًا.');
      setStatus('error');
      return;
    }

    setStatus('sent');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-cream-50 to-mint-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <SchoolLogo size={64} className="mb-3 rounded-xl" />
          <h1 className="text-lg font-extrabold text-navy-800">استعادة كلمة المرور</h1>
          <p className="mt-1 text-sm text-navy-500">مدرسة أسماء بنت النعمان (1-8)</p>
        </div>

        {status === 'sent' ? (
          <div className="space-y-4 text-center">
            <p className="rounded-lg bg-mint-50 px-3 py-3 text-sm font-semibold text-mint-700">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. افتحي الرسالة واضغطي على الرابط لتعيين
              كلمة مرور جديدة.
            </p>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700"
            >
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
            >
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              إرسال رابط إعادة التعيين
            </button>

            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 text-sm font-bold text-navy-500 hover:text-navy-700"
            >
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
