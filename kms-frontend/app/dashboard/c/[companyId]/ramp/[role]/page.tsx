// app/dashboard/c/[companyId]/ramp/[role]/page.tsx
// This page displays the ramp plan for a specific role within a company in the KMS application.
// It fetches the user context and checks if the user has access to the specified company.
// If the user is not logged in or does not have access, they are redirected to the login page or dashboard, respectively.
// The page fetches the ramp plan data from an external NLP service and displays it using the RampWorkspace component.

import { getUserContext } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { RampWorkspace } from '@/components/ramp/RampWorkspace';

const NLP = process.env.NLP_API_URL || 'http://localhost:8000';

export default async function RampRolePage({
  params,
}: {
  params: Promise<{ companyId: string; role: string }>;
}) {
  const { companyId, role: roleParam } = await params;
  const role = decodeURIComponent(roleParam).toLowerCase();

  const user = await getUserContext();
  if (!user) redirect('/login');
  if (!user.companies.some((c) => c.id === companyId)) redirect('/dashboard');

  const res = await fetch(
    `${NLP}/ramp-plans?company_id=${encodeURIComponent(companyId)}&role=${encodeURIComponent(role)}`,
    {
      cache: 'no-store',
      headers: {
        'X-Company-Id': companyId,
        'X-User-Id': user.id,
      },
    }
  );
  const data = await res.json().catch(() => null);
  const plan = data?.plan || data;

  if (!res.ok || !plan || (!plan.steps && !plan.title)) {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tighter">No ramp for {role}</h1>
        <p className="text-zinc-500 mt-2">Generate one from the First 7 Days page.</p>
        <Link
          href={`/dashboard/c/${companyId}/ramp`}
          className="inline-block mt-6 text-sm text-zinc-300 underline underline-offset-4"
        >
          Generate ramp
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/c/${companyId}/ramp`}
          className="text-xs text-zinc-600 hover:text-zinc-400"
        >
          ← All ramps
        </Link>
      </div>
      <RampWorkspace plan={plan} companyId={companyId} role={role} />
    </div>
  );
}
