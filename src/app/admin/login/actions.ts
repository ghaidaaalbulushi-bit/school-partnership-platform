'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/admin/audit';

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: 'بيانات الدخول غير صحيحة. تحققي من البريد الإلكتروني وكلمة المرور.' };
  }

  await logAudit(supabase, data.user, { action: 'login', entityType: 'auth' });
  redirect('/admin');
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await logAudit(supabase, user, { action: 'logout', entityType: 'auth' });
  await supabase.auth.signOut();
  redirect('/admin/login');
}
