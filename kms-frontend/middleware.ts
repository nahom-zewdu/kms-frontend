// middleware.ts
// Authentication middleware for protected dashboard routes and auth pages.
// It preserves session cookies, handles missing sessions cleanly, and redirects users consistently.

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Make refreshed cookies available to downstream server components.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          // Persist refreshed cookies in the browser.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('[middleware] auth.getUser error', error);
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

    // Do not lose cookie refreshes or cookie deletions on redirects.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
