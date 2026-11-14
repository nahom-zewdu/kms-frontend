// app/api/invite/accept/route.ts
// This is the API route for accepting an invite to join a company.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // TODO: Validate token and assign company/role.
  await request.json();

  return NextResponse.json({ ok: true });
}
