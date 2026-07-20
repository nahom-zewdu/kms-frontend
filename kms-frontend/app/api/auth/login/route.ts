// api/auth/login/route.ts
// This route handles user login by accepting email and password in the request body.
// It authenticates with Supabase, sets the server cookie session, and returns a redirect on success.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user || !data.session) {
    return NextResponse.json({ error: 'Login failed. Please check your credentials and try again.' }, { status: 400 });
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (setErr) {
    console.error('setSession error:', setErr);
    return NextResponse.json({ error: setErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, redirect: '/dashboard' });
}
