// api/auth/signup/route.ts
// This route handles user signup by accepting name, email, and password in the request body. 
// It uses Supabase's auth API to create a new user. If signup is successful, it creates a user profile in the 'profiles' table with default values. 
// Finally, it returns a JSON response indicating success and provides a redirect URL to the dashboard or a message to confirm email. 
// If there are any errors during signup or profile creation, it returns an appropriate error message.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

async function getProfileClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminSupabase();
  }
  return await createServerSupabase();
}

async function upsertProfile(userId: string, name: string) {
  const profileClient = await getProfileClient();
  const { error } = await profileClient.from('profiles').upsert({
    id: userId,
    name,
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
  const name = body?.name?.toString().trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 400 });
  }

  if (data.session) {
    const { error: setErr } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    if (setErr) {
      console.error('setSession error:', setErr);
      return NextResponse.json({ error: setErr.message }, { status: 500 });
    }

    try {
      await upsertProfile(data.user.id, name);
    } catch (profileError) {
      return NextResponse.json(
        { error: 'Could not create profile. Please try again or contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, redirect: '/dashboard' });
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      await upsertProfile(data.user.id, name);
    } catch (profileError) {
      return NextResponse.json(
        { error: 'Could not create profile. Please try again or contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: 'Signup successful. Please confirm your email before logging in.' });
  }

  return NextResponse.json({
    ok: false,
    error:
      'Signup was accepted, but no confirmation session was created and the server cannot create a profile without SUPABASE_SERVICE_ROLE_KEY. Confirm email and log in, or set SUPABASE_SERVICE_ROLE_KEY for server-side profile creation.',
  }, { status: 400 });
}
