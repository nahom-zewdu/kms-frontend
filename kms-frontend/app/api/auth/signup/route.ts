// api/auth/signup/route.ts
// This route handles user signup by creating a new Supabase user with the service role key,
// generating the associated profile row in the database, and immediately starting a session.
// The service role key is required for this workflow because the profiles table is protected by RLS.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

async function createUser(email: string, password: string, name: string) {
  const adminSupabase = createAdminSupabase();
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('User creation failed.');
  }

  const { error: profileError } = await adminSupabase.from('profiles').upsert({
    id: data.user.id,
    name,
    company_id: 'default',
  });

  if (profileError) {
    throw profileError;
  }

  return data.user;
}

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();
  const name = body?.name?.toString().trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'SUPABASE_SERVICE_ROLE_KEY is required for signup. Add it to .env.local and restart the server.',
      },
      { status: 500 }
    );
  }

  try {
    await createUser(email, password, name);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    console.error('Sign in after createUser failed:', error);
    return NextResponse.json({ error: 'Signup succeeded but login failed. Please try logging in.' }, { status: 500 });
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
