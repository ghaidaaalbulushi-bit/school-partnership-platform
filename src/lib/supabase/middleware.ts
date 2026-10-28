import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session cookie on every request and protects
 * /admin routes (except /admin/login) by redirecting unauthenticated
 * visitors to the login page. This is the real enforcement boundary for the
 * admin area — RLS protects the data, this protects the UI.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return supabaseResponse;
}
