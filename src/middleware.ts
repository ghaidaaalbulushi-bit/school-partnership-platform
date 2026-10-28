import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on everything except static files and image optimization,
     * so the auth cookie stays fresh across navigations.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)',
  ],
};
