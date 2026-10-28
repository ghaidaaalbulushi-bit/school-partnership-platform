'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SchoolLogo } from '@/components/SchoolLogo';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // The recovery link lands here with the token in the URL; the browser
    // client picks it up automatically and fires PASSWORD_RECOVERY once the
    // session is established from it.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Fallback in case the event already fired before this component mounted.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        // Give the auth state change listener a moment before concluding
        // the link is invalid/expired.
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (!d2.session) setInvalidLink(true);
          });
        }, 2500);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setStatus('loading');
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('تعذّر تحديث كلمة المرور. جرّبي طلب رابط جديد.');
      setStatus('error');
      return;
    }

    setStatus('done');
    setTimeout(() => router.push('/admin'), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-cream-50 to-mint-50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <SchoolLogo size={64} className="mb-3 rounded-xl" />
          <h1 className="text-lg font-extrabold text-navy-800">تعيين كلمة مرور جديدة</h1>
          <p className="mt-1 text-sm text-navy-500">مدرسة أسماء بنت النعمان (1-8)</p>
        </div>

        {invalidLink ? (
          <div className="space-y-4 text-center">
            <p className="rounded-lg bg-rose-50 px-3 py-3 text-sm font-semibold text-rose-600">
              انتهت صلاحية الرابط أو أنه غير صحيح. الرجاء طلب رابط جديد.
            </p>
            <Link
              href="/admin/forgot-password"
              className="inline-block rounded-full bg-navy-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-800"
            >
              طلب رابط جديد
            </Link>
          </div>
        ) : status === 'done' ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-mint-500" />
            <p className="text-sm font-semibold text-navy-700">تم تحديث كلمة المرور بنجاح. جارٍ تحويلك...</p>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
            <p className="text-sm text-navy-500">جارٍ التحقق من الرابط...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-navy-700">
                كلمة المرور الجديدة
              </label>
              <input
                id="password"
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-bold text-navy-700">
                تأكيد كلمة المرور
              </label>
              <input
                id="confirm"
                type="password"
                required
                dir="ltr"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-sky-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-navy-800 disabled:opacity-60"
            >
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              تحديث كلمة المرور
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
