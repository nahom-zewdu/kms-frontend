// app/api/ramp-plans/generate/route.ts
// This API route handles requests for generating ramp plans in the KMS application.
// It checks if the user is authenticated and authorized to generate ramp plans for the specified company based on their role.
// The route sends a POST request to an external NLP service to generate the ramp plan and returns the response as JSON.

import { getUserContext } from '@/lib/auth';
import { NextResponse } from 'next/server';

const NLP = process.env.NLP_API_URL || 'http://localhost:8000';

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

  const res = await fetch(`${NLP}/ramp-plans/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_id: companyId,
      role,
      employee_name: employeeName,
    }),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
