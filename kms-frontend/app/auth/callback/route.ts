// app/auth/callback/route.ts
// This route handles the OAuth callback from Supabase authentication. 
// It retrieves the authorization code from the query parameters, exchanges it for a session using Supabase's auth API, and sets the session cookies. 
// After successfully exchanging the code for a session, it redirects the user to the dashboard page. If there is no code in the query parameters, it simply redirects to the dashboard without performing any actions.  

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => 
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
