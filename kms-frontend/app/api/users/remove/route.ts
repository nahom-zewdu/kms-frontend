// app/api/users/remove/route.ts
// This is the API route for removing a user from the company.
// It checks if the user is an admin and deletes the specified user from the database.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { userId } = await request.json();

  const supabase = await createServerSupabase();
  await supabase.from('profiles').delete().eq('id', userId).eq('company_id', user.company_id);

  return NextResponse.json({ ok: true });
}
