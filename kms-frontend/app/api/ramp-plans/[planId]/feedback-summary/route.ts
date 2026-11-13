import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { fetchRampApi } from '@/lib/ramp-api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  const user = await getUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = user.activeCompany?.id || user.companies[0]?.id;
  if (!companyId) {
    return NextResponse.json({ error: 'No active company found' }, { status: 403 });
  }
  if (!user.accessToken) {
    return NextResponse.json(
      { error: 'A valid Supabase access token is required.' },
      { status: 401 }
    );
  }

  const { planId } = await params;
  const res = await fetchRampApi(
    `/${encodeURIComponent(planId)}/feedback-summary`,
    { accessToken: user.accessToken, companyId }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
