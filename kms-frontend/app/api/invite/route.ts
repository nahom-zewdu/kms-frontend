// app/api/invite/route.ts

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { email, role } = await request.json();

  // TODO: Send real email invite (use Resend or Supabase)
  console.log(`Invite sent to ${email} as ${role}`);

  return NextResponse.json({ ok: true });
}
