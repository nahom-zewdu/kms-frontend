// app/api/invite/route.ts
// This is the API route for inviting a new user to the company.
// It checks if the user is an admin and generates an invite token for the specified email and role.

import { requireRole } from '@/lib/permissions';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await requireRole('admin');
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { email, role } = await request.json();

  const supabase = await createServerSupabase();

  // Create invite token (simple for MVP)
  const inviteToken = `invite_${Date.now()}`;

  // TODO: Send real email with token (use Resend later)
  console.log(`Invite to ${email} with role ${role} - Token: ${inviteToken}`);

  return NextResponse.json({ ok: true, token: inviteToken });
}
