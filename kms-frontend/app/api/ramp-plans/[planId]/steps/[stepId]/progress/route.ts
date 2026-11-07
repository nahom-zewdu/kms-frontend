import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { fetchRampApi } from '@/lib/ramp-api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planId: string; stepId: string }> }
) {
  const user = await getUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { planId, stepId } = await params;
  const body = await request.json().catch(() => ({}));
  const status = body?.status;
  const companyId = user.activeCompany?.id || user.companies[0]?.id;

  if (!companyId) {
    return NextResponse.json({ error: 'No active company found' }, { status: 403 });
  }

  if (status !== 'in_progress' && status !== 'completed') {
    return NextResponse.json(
      { error: 'status must be in_progress or completed' },
      { status: 400 }
    );
  }
  if (!user.accessToken) {
    return NextResponse.json(
      { error: 'A valid Supabase access token is required.' },
      { status: 401 }
    );
  }

  const res = await fetchRampApi(
    `/${encodeURIComponent(planId)}/steps/${encodeURIComponent(stepId)}/progress`,
    {
      accessToken: user.accessToken,
      companyId,
      request: {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      },
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
