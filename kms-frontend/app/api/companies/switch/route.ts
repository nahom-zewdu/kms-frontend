import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || !('companyId' in body) || typeof body.companyId !== 'string') {
    return NextResponse.json({ error: 'A valid companyId is required.' }, { status: 400 });
  }

  if (!user.companies.some((company) => company.id === body.companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set('active_company_id', body.companyId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return NextResponse.json({ ok: true });
}
