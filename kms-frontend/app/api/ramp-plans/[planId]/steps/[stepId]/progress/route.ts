import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';

const NLP = process.env.NLP_API_URL || 'http://localhost:8000';

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

  const res = await fetch(
    `${NLP}/ramp-plans/${encodeURIComponent(planId)}/steps/${encodeURIComponent(stepId)}/progress`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
