// app/api/invite/route.ts

import { requireRole } from '@/lib/permissions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await requireRole('manager');

  const { email, role } = await request.json();

  // TODO: Send real email invite (use Resend or Supabase)
  console.log(`Invite sent to ${email} as ${role}`);

  return NextResponse.json({ ok: true });
}
