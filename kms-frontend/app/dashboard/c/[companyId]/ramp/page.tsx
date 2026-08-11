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
    <div className="max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tighter">First 7 Days</h1>
        <p className="text-zinc-500 mt-2">
          Live ramp paths for this company ordered modules, risk, and owners when known.
        </p>
      </div>

      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-wide text-zinc-600 mb-4">Active ramps</h2>

        {plans && plans.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {plans.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/c/${companyId}/ramp/${encodeURIComponent(p.role)}`}
                  className="block border border-zinc-800 p-6 hover:border-zinc-600 transition-colors h-full"
                >
                  <div className="font-medium tracking-tight">
                    First 7 Days — {p.role}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1 font-mono">{p.role}</div>
                  {p.employee_name ? (
                    <div className="text-sm text-zinc-400 mt-2">For {p.employee_name}</div>
                  ) : null}
                  <div className="text-xs text-zinc-600 mt-4">
                    {p.created_at
                      ? `Updated ${new Date(p.created_at).toLocaleDateString()}`
                      : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-zinc-800 border-dashed p-12 text-center">
            <Route className="w-8 h-8 mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-400">No active ramps yet</p>
            <p className="text-sm text-zinc-600 mt-1">
              Generate one after a repository baseline is synced.
            </p>
          </div>
        )}
      </section>

      {canGenerate && <GenerateRampForm companyId={companyId} />}
    </div>
  );
}
