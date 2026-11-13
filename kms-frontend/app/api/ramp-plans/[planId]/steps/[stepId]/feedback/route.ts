import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { fetchRampApi } from '@/lib/ramp-api';

type RouteContext = { params: Promise<{ planId: string; stepId: string }> };

async function getContext() {
  const user = await getUserContext();
  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const companyId = user.activeCompany?.id || user.companies[0]?.id;
  if (!companyId) {
    return { response: NextResponse.json({ error: 'No active company found' }, { status: 403 }) };
  }
  if (!user.accessToken) {
    return {
      response: NextResponse.json(
        { error: 'A valid Supabase access token is required.' },
        { status: 401 }
      ),
    };
  }
  return { user, companyId };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const context = await getContext();
  if ('response' in context) return context.response;

  const { planId, stepId } = await params;
  const res = await fetchRampApi(
    `/${encodeURIComponent(planId)}/steps/${encodeURIComponent(stepId)}/feedback`,
    { accessToken: context.user.accessToken, companyId: context.companyId }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const context = await getContext();
  if ('response' in context) return context.response;

  const body = await request.json().catch(() => ({}));
  const rating = body?.rating;
  const reason = body?.reason;
  if (!['useful', 'partially_useful', 'not_useful'].includes(rating)) {
    return NextResponse.json({ error: 'A valid feedback rating is required.' }, { status: 400 });
  }
  if (reason !== undefined && reason !== null && typeof reason !== 'string') {
    return NextResponse.json({ error: 'Feedback reason must be text.' }, { status: 400 });
  }
  if (typeof reason === 'string' && reason.length > 1000) {
    return NextResponse.json({ error: 'Feedback reason must be 1000 characters or fewer.' }, { status: 400 });
  }

  const { planId, stepId } = await params;
  const res = await fetchRampApi(
    `/${encodeURIComponent(planId)}/steps/${encodeURIComponent(stepId)}/feedback`,
    {
      accessToken: context.user.accessToken,
      companyId: context.companyId,
      request: {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reason }),
      },
    }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
