import 'server-only';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/** Call at the top of any Server Action or admin Route Handler that
 * mutates data. Throws the visitor back to /admin/login if there is no
 * authenticated session — this is the real enforcement; RLS is the second,
 * independent layer (see supabase/migrations/0002_rls_policies.sql). */
export async function requireAdmin(): Promise<{ user: User; supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return { user, supabase };
}
