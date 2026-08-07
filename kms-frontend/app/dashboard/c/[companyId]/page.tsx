// app/dashboard/c/[companyId]/page.tsx
// This page displays the overview of a specific company in the KMS dashboard.
// It fetches the user context and checks if the user has access to the specified company.
// If the user is not logged in or does not have access, they are redirected to the login page or dashboard, respectively.

import { getUserContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CompanyOverviewPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) redirect('/login');

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) redirect('/dashboard');

  return (
    <div>
      <h1 className="text-4xl font-semibold tracking-tighter">{membership.name}</h1>
      <p className="text-zinc-500 mt-2 capitalize">Role: {membership.role}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href={`/dashboard/c/${companyId}/playbooks`}
          className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="font-medium">Playbooks</div>
          <div className="text-sm text-zinc-500 mt-1">Onboarding workspaces</div>
        </Link>
        <Link
          href={`/dashboard/c/${companyId}/settings`}
          className="border border-zinc-800 p-6 hover:border-zinc-600 transition-colors"
        >
          <div className="font-medium">Settings</div>
          <div className="text-sm text-zinc-500 mt-1">Integrations &amp; company</div>
        </Link>
      </div>
    </div>
  );
}
