import { getUserContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

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

  const canManage = membership.role === 'admin' || membership.role === 'manager';

  return (
    <div>
      <PageHeader
        kicker="Company"
        title={membership.name}
        description={`Your role: ${membership.role}`}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/dashboard/c/${companyId}/ramp`}
          className="kms-card p-5 transition-colors hover:border-zinc-600"
        >
          <div className="font-medium">First 7 Days</div>
          <div className="mt-1 text-sm text-zinc-500">
            Live ramp path from this company&apos;s codebase
          </div>
        </Link>
        <Link
          href={`/dashboard/c/${companyId}/playbooks`}
          className="kms-card p-5 transition-colors hover:border-zinc-600"
        >
          <div className="font-medium">Playbooks</div>
          <div className="mt-1 text-sm text-zinc-500">Onboarding workspaces</div>
        </Link>
        {canManage && (
          <Link
            href={`/dashboard/c/${companyId}/members`}
            className="kms-card p-5 transition-colors hover:border-zinc-600"
          >
            <div className="font-medium">Members</div>
            <div className="mt-1 text-sm text-zinc-500">People in this company</div>
          </Link>
        )}
        {membership.role === 'admin' && (
          <Link
            href={`/dashboard/c/${companyId}/settings`}
            className="kms-card p-5 transition-colors hover:border-zinc-600"
          >
            <div className="font-medium">Settings</div>
            <div className="mt-1 text-sm text-zinc-500">Integrations and company</div>
          </Link>
        )}
      </div>
    </div>
  );
}
