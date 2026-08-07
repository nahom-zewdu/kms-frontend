// app/api/companies/switch/route.ts
// This API route handles switching the active company for the user.
// It receives a POST request with the company ID and sets it in the cookies for future requests.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { companyId } = await request.json();
  const cookieStore = await cookies();
  cookieStore.set('active_company_id', companyId, { path: '/' });
  return NextResponse.json({ ok: true });
}
