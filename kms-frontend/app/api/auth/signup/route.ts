// api/auth/signup/route.ts
// This route handles user signup by creating a Supabase user with the service role key,
// writing the associated profile row, and signing the user in with a server-side session.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function jsonResponse(payload: { ok: boolean; error?: string; redirect?: string; message?: string }, status = 200) {
  return NextResponse.json(payload, { status });
}

function logAuthError(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[auth:signup:${context}]`, message);
}

function validateSignupInput(email: string, password: string, name: string) {
  if (!emailRegex.test(email)) {
    return 'Enter a valid email address.';
  }
  if (!passwordRegex.test(password)) {
    return 'Password must be at least 8 characters and include at least one number.';
  }
  if (name.trim().length < 2) {
    return 'Name must include at least two characters.';
  }
  return null;
}

async function createUser(email: string, password: string, name: string) {
  const adminSupabase = createAdminSupabase();

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (error) {
    const lowered = error.message?.toLowerCase() ?? '';
    if (lowered.includes('already exists') || lowered.includes('duplicate')) {
      throw new Error('An account already exists with this email. Please sign in instead.');
    }
    throw new Error('Unable to create account. Please try again later.');
  }

  if (!data.user) {
    throw new Error('Unable to create account. Please try again.');
  }

  const { error: profileError } = await adminSupabase.from('profiles').upsert({
    id: data.user.id,
    name,
    company_id: 'default',
  });

  if (profileError) {
    logAuthError('profile-upsert', profileError);
    throw new Error('Account created, but we could not create your profile. Please contact support.');
  }

  return data.user;
}

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();
  const name = body?.name?.toString().trim();

  if (!email || !password || !name) {
    return jsonResponse({ ok: false, error: 'Name, email, and password are required.' }, 400);
  }

  const validationError = validateSignupInput(email, password, name);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      {
        ok: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY is required for signup. Add it to .env.local and restart the server.',
      },
      500
    );
  }

  try {
    await createUser(email, password, name);
  } catch (err) {
    logAuthError('create-user', err);
    return jsonResponse({ ok: false, error: err instanceof Error ? err.message : 'Signup failed.' }, 400);
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    logAuthError('sign-in', error);
    const message = String(error.message ?? 'Unable to sign in after signup.');
    return jsonResponse({ ok: false, error: message }, 500);
  }

  if (!data?.session) {
    logAuthError('sign-in-missing-session', 'No session returned from Supabase after signup.');
    return jsonResponse({ ok: false, error: 'Signup completed but we could not create your session. Please sign in.' }, 500);
  }

  const { error: setErr } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (setErr) {
    logAuthError('set-session', setErr);
    return jsonResponse({ ok: false, error: 'Unable to establish a session. Please sign in manually.' }, 500);
  }

  return jsonResponse({ ok: true, redirect: '/dashboard' });
}
