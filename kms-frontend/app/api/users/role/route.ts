// app/api/users/role/route.ts
// This is the API route for changing a user's role.
// It checks if the user is an admin and updates the role of the specified user in the database.

import { requireRole } from '@/lib/permissions';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let user;
  try {
    user = await requireRole('admin');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { userId, role } = await request.json();
  if (!userId || !['admin', 'manager', 'member'].includes(role)) {
    return NextResponse.json({ error: 'userId and a valid role are required' }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json({ error: 'You cannot change your own membership role' }, { status: 403 });
  }
  const companyId = user.activeCompany?.id;
  if (!companyId) return NextResponse.json({ error: 'No active company found' }, { status: 403 });

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('company_members')
    .update({ role })
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .select('id')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Unable to update membership role' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Membership not found or role change forbidden' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
