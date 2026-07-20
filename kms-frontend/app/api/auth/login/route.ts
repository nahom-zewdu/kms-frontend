// api/auth/login/route.ts
// This route handles user login by accepting email and password in the request body. 
// It uses Supabase's auth API to authenticate the user. If authentication is successful, it ensures that a user profile exists in the 'profiles' table. 
// If the profile does not exist, it creates one with default values. Finally, it returns a JSON response indicating success and provides a redirect URL to the dashboard. 
// If there are any errors during authentication or profile creation, it returns an appropriate error message.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

async function getProfileClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminSupabase();
  }
  return await createServerSupabase();
}

async function ensureProfile(userId: string, email: string) {
  const profileClient = await getProfileClient();
  const { error } = await profileClient.from('profiles').upsert({
    id: userId,
    name: email.split('@')[0],
    company_id: 'default',
  });
  if (error) {
    console.error('Profile upsert error:', error);
    throw new Error(
      error.message ||
        'Profile upsert failed. Ensure SUPABASE_SERVICE_ROLE_KEY is set or profile RLS allows authenticated inserts.'
    );
  }
}

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

  if (!data.user) {
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 400 });
  }
  // If Supabase returned a session, ensure server cookies are set
  if (data.session) {
    const { error: setErr } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (setErr) {
      console.error('setSession error:', setErr);
      return NextResponse.json({ error: setErr.message }, { status: 500 });
    }
  }

  try {
    await ensureProfile(data.user.id, email);
  } catch (profileError) {
    return NextResponse.json(
      {
        error:
          profileError instanceof Error
            ? `Profile creation failed: ${profileError.message}. Ensure SUPABASE_SERVICE_ROLE_KEY is set or profile RLS allows authenticated writes.`
            : 'Could not create profile. Please try again or contact support.',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, redirect: '/dashboard' });
}
