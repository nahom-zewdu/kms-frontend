// app/api/users/role/route.ts
// This is the API route for changing a user's role.
// It checks if the user is an admin and updates the role of the specified user in the database.

import { requireRole } from '@/lib/permissions';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await requireRole('admin');
  const { userId, role } = await request.json();

  const supabase = await createServerSupabase();
  await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .eq('company_id', user.company_id);

  return NextResponse.json({ ok: true });
}
