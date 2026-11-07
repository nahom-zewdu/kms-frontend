// This API route forwards an authorized company ramp-generation request to the NLP service.

import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { fetchRampApi } from '@/lib/ramp-api';

export async function POST(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const companyId = body?.company_id || body?.companyId;
  const role = (body?.role || '').toString().trim().toLowerCase().replace(/\s+/g, '-');
  const employeeName = body?.employee_name || body?.employeeName || '';

  if (!companyId || !role) {
    return NextResponse.json({ error: 'company_id and role required' }, { status: 400 });
  }

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (membership.role === 'member') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  if (!user.accessToken) {
    return NextResponse.json(
      { error: 'A valid Supabase access token is required.' },
      { status: 401 }
    );
  }

  const res = await fetchRampApi('/generate', {
    accessToken: user.accessToken,
    companyId,
    request: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: companyId,
        role,
        employee_name: employeeName,
      }),
    },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
