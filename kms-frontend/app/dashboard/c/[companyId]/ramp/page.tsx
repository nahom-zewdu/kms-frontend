// app/dashboard/c/[companyId]/ramp/page.tsx
// This page displays the first 7 days ramp plan for a specific company in the KMS application.
// It allows the user to select a role and optionally enter a new hire's name to generate a ramp plan.
// The page fetches the user context and checks if the user has access to the specified company.
// If the user is not logged in or does not have access, they are redirected to the login page or dashboard, respectively.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Route } from 'lucide-react';
import { GenerateRampForm } from '@/components/ramp/GenerateRampForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function RampIndexPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) redirect('/login');

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) redirect('/dashboard');

  const supabase = await createServerSupabase();
  const { data: plans, error } = await supabase
    .from('ramp_plans')
    .select('id, role, employee_name, is_active, created_at, company_id')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ramp_plans list error:', error);
  }

  const canGenerate = membership.role === 'admin' || membership.role === 'manager';

  return (
    <div className="min-w-0 max-w-5xl">
      <PageHeader
        kicker="Company"
        title="First 7 Days"
        description="Live onboarding paths that connect modules, risks, and owners."
      />

      <section aria-labelledby="active-ramps-heading" className="mb-8">
        <h2 id="active-ramps-heading" className="mb-3 text-sm font-medium text-zinc-300">
          Active ramps
        </h2>

        {error ? (
          <div role="alert" className="border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
            Could not load active ramps. Refresh the page to try again.
          </div>
        ) : plans && plans.length > 0 ? (
          <ul className="grid min-w-0 gap-2 sm:grid-cols-2">
            {plans.map((plan) => (
              <li key={plan.id} className="min-w-0">
                <Link
                  href={`/dashboard/c/${companyId}/ramp/${encodeURIComponent(plan.role)}`}
                  className="kms-card block h-full min-w-0 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40 sm:p-5"
                >
                  <div className="break-words font-medium tracking-tight">
                    First 7 Days — {plan.role}
                  </div>
                  {plan.employee_name ? (
                    <div className="mt-1 break-words text-sm text-zinc-400">
                      For {plan.employee_name}
                    </div>
                  ) : null}
                  <div className="mt-3 text-xs text-zinc-600">
                    {plan.created_at
                      ? `Updated ${new Date(plan.created_at).toLocaleDateString()}`
                      : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Route}
            title="No active ramps yet"
            description="Generate one after a repository baseline is synced."
          />
        )}
      </section>

      {canGenerate && <GenerateRampForm companyId={companyId} />}
    </div>
  );
}
