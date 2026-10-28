import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Server-side Supabase client (anon key + visitor's auth cookies if any).
 * Use in Server Components, Route Handlers, and Server Actions that act as
 * "the current visitor" (respects RLS normally — admin-only rows only come
 * back if the visitor is actually logged in as the admin).
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component without a mutable cookie jar
            // (e.g. during static rendering) — safe to ignore; middleware
            // refreshes the session cookie on navigations instead.
          }
        },
      },
    }
  );
}

/**
 * Service-role client — bypasses RLS entirely. NEVER import this into any
 * file that ships to the browser. Only used from Route Handlers / Netlify
 * Functions for privileged server-only operations (e.g. the AI analysis
 * pipeline writing ai_analyses rows on behalf of background processing).
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Server-only operations that bypass RLS cannot run without it.'
    );
  }
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
