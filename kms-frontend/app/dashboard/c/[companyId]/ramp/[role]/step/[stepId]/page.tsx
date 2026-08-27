// app/dashboard/c/[companyId]/ramp/[role]/step/[stepId]/page.tsx
// This page displays a specific step within a ramp plan for a given role in a company.
// It fetches the user context and checks if the user has access to the specified company.
// If the user is not logged in or does not have access, they are redirected to the login page or dashboard, respectively.
// The page fetches the ramp plan data from an external NLP service and identifies the specific step based on the provided stepId.
// If the step is found, it renders the StepWorkspace component; otherwise, it displays an error message with a link back to the ramp overview.

import { getUserContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StepWorkspace } from '@/components/ramp/StepWorkspace';

const NLP = process.env.NLP_API_URL || 'http://localhost:8000';

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

  const res = await fetch(
    `${NLP}/ramp-plans?company_id=${encodeURIComponent(companyId)}&role=${encodeURIComponent(role)}`,
    { cache: 'no-store' }
  );
  const data = await res.json().catch(() => null);
  const plan = data?.plan || data;
  const steps = plan?.steps || [];
  const step =
    steps.find((s: { id?: string }) => s.id === stepId) ||
    steps.find((s: { order?: number }) => String(s.order) === stepId);

  if (!res.ok || !plan || !step) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tighter">Step not found</h1>
        <p className="text-zinc-500 mt-2">
          Regenerate the ramp so steps get stable ids, then open again.
        </p>
        <Link
          href={`/dashboard/c/${companyId}/ramp/${encodeURIComponent(role)}`}
          className="inline-block mt-6 text-sm text-zinc-300 underline underline-offset-4"
        >
          Back to path
        </Link>
      </div>
    );
  }

  return (
    <StepWorkspace plan={plan} step={step} companyId={companyId} role={role} />
  );
}