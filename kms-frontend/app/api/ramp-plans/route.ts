// app/api/ramp-plans/route.ts
// This API route handles requests for ramp plans in the KMS application. 
// It checks if the user is authenticated and authorized to access the specified company's ramp plans based on their role.
// The route fetches ramp plan data from an external NLP service and returns it as a JSON response.

import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { fetchRampApi } from '@/lib/ramp-api';

export async function GET(request: Request) {
  const user = await getUserContext();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  const role = searchParams.get('role');
  if (!companyId || !role) {
    return NextResponse.json({ error: 'companyId and role required' }, { status: 400 });
  }
  if (!user.companies.some((c) => c.id === companyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!user.accessToken) {
    return NextResponse.json(
      { error: 'A valid Supabase access token is required.' },
      { status: 401 }
    );
  }

  const query = new URLSearchParams({ company_id: companyId, role });
  const res = await fetchRampApi(`?${query}`, {
    accessToken: user.accessToken,
    companyId,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
