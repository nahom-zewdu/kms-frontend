// app/api/invite/accept/route.ts
// This is the API route for accepting an invite to join a company.

import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token } = await request.json();

  // TODO: Validate token and assign company/role
  const supabase = await createServerSupabase();
  // Logic to link user to company

  return NextResponse.json({ ok: true });
}
