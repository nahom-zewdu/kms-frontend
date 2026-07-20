// api/auth/login/route.ts
// This route handles user login by accepting email and password in the request body. 
// It uses Supabase's auth API to authenticate the user. If authentication is successful, it ensures that a user profile exists in the 'profiles' table. 
// If the profile does not exist, it creates one with default values. Finally, it returns a JSON response indicating success and provides a redirect URL to the dashboard. 
// If there are any errors during authentication or profile creation, it returns an appropriate error message.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

async function ensureProfile(userId: string, email: string) {
  const supabase = createServerSupabase();
  await supabase.from('profiles').upsert({
    id: userId,
    name: email.split('@')[0],
    company_id: 'default',
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 400 });
  }

  await ensureProfile(data.user.id, email);
  return NextResponse.json({ ok: true, redirect: '/dashboard' });
}
