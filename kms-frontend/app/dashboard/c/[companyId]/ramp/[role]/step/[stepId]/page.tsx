// This page displays a specific step within a ramp plan for a role and company.

import { getUserContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StepWorkspace } from '@/components/ramp/StepWorkspace';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchRampApi } from '@/lib/ramp-api';

export default async function RampStepPage({
  params,
}: {
  params: Promise<{ companyId: string; role: string; stepId: string }>;
}) {
  const { companyId, role: roleParam, stepId } = await params;
  const role = decodeURIComponent(roleParam).toLowerCase();

  const user = await getUserContext();
  if (!user) redirect('/login');
  if (!user.companies.some((c) => c.id === companyId)) redirect('/dashboard');

  const query = new URLSearchParams({ company_id: companyId, role });
  const res = await fetchRampApi(`?${query}`, {
    accessToken: user.accessToken,
    companyId,
  });
  const data = await res.json().catch(() => null);
  const plan = data?.plan || data;
  const steps = plan?.steps || [];
  const step =
    steps.find((s: { id?: string }) => s.id === stepId) ||
    steps.find((s: { order?: number }) => String(s.order) === stepId);
  const backLink = (
    <Link
      href={`/dashboard/c/${companyId}/ramp/${encodeURIComponent(role)}`}
      className="inline-block mt-6 text-sm text-zinc-300 underline underline-offset-4"
    >
      Back to path
    </Link>
  );

  if (!res.ok) {
    console.error('[ramp] step plan request failed', { status: res.status });
    const description =
      res.status === 401
        ? 'The Ramp service rejected the Supabase access token (401). Refresh the page and sign in again.'
        : res.status === 403
          ? 'The Ramp service denied access to this company (403). Verify your company membership.'
          : 'The ramp service could not return this path.';
    return (
      <div>
        <PageHeader title="Could not load ramp step" description={description} />
        {backLink}
      </div>
    );
  }

  if (!plan || !step) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tighter">Step not found</h1>
        <p className="text-zinc-500 mt-2">
          Regenerate the ramp so steps get stable ids, then open again.
        </p>
        {backLink}
      </div>
    );
  }

  return <StepWorkspace plan={plan} step={step} companyId={companyId} role={role} />;
}
