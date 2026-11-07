// Authentication proxy for protected dashboard routes and auth pages.
// It preserves session cookies, handles missing sessions cleanly, and redirects users consistently.

import { createServerClient } from '@supabase/ssr';
import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const applyAuthCookies: Array<(target: NextResponse) => void> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            applyAuthCookies.push((target) => {
              target.cookies.set(name, value, options);
            });
          });

          response = NextResponse.next({ request });
          applyAuthCookies.forEach((applyCookie) => applyCookie(response));
        }
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && !isAuthSessionMissingError(error)) {
    console.error('[proxy] Supabase getUser failed', {
      name: error.name,
      code: error.code,
    });
  }

  const pathname = request.nextUrl.pathname;
  const isAuthPage = ['/login', '/signup'].includes(pathname);
  const isDashboardPath = pathname.startsWith('/dashboard');

  let redirectUrl: URL | null = null;

  if (isDashboardPath && !user) {
    redirectUrl = new URL('/login', request.url);
  } else if (user && isAuthPage) {
    redirectUrl = new URL('/dashboard', request.url);
  }

  if (redirectUrl) {
    const redirectResponse = NextResponse.redirect(redirectUrl);

    applyAuthCookies.forEach((applyCookie) => applyCookie(redirectResponse));

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
