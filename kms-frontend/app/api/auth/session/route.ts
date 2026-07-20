// api/auth/session/route.ts
// This route handles setting the Supabase session on the server side. 
// It accepts access_token and refresh_token in the request body, and uses Supabase's setSession method to establish the session. 
// If successful, it returns a JSON response indicating success. 
// If there are any errors during the session setup, it returns an appropriate error message.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing access_token or refresh_token' }, { status: 400 });
    }

    const supabase = createServerSupabase();
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });

    if (error) {
      console.error('Supabase setSession error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Auth session endpoint error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
