// middleware.ts
// This middleware handles authentication and authorization for the application.
// It checks if a user is authenticated and redirects them to the appropriate pages based on their authentication status.
// If a user is not authenticated and tries to access the dashboard, they are redirected to the login page. 
// Conversely, if an authenticated user tries to access the login page, they are redirected to the dashboard.
// The middleware also allows access to the OAuth callback route without any restrictions.

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
            });
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isCallback = request.nextUrl.pathname.startsWith('/auth/callback');

  // Allow callback to run
  if (isCallback) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users from dashboard
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/auth/callback'],
};
