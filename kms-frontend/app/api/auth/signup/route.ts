// api/auth/signup/route.ts
// This route handles user signup by accepting name, email, and password in the request body. 
// It uses Supabase's auth API to create a new user. If signup is successful, it creates a user profile in the 'profiles' table with default values. 
// Finally, it returns a JSON response indicating success and provides a redirect URL to the dashboard or a message to confirm email. 
// If there are any errors during signup or profile creation, it returns an appropriate error message.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toString().trim();
  const password = body?.password?.toString();
  const name = body?.name?.toString().trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }

  const supabase = createServerSupabase();
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

  await supabase.from('profiles').upsert({
    id: data.user.id,
    name,
    company_id: 'default',
  });

  if (data.session) {
    return NextResponse.json({ ok: true, redirect: '/dashboard' });
  }

  return NextResponse.json({ ok: true, message: 'Signup successful. Please confirm your email before logging in.' });
}
