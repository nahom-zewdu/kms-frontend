// app/dashboard/company/[companyId]/page.tsx
// This is the main page for a specific company's dashboard in the KMS application.
// It displays an overview of the company, including the number of active playbooks and team members.
// It uses the getUserContext function to fetch user information and company memberships, and the createServerSupabase function to query the database for playbook and member counts.

import { getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase-server';
import { Plus, BookOpen, Users } from 'lucide-react';

export default async function CompanyDashboard({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership) return null;

  const supabase = await createServerSupabase();

  const { count: playbookCount } = await supabase
    .from('playbooks')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('is_active', true);

  const { count: memberCount } = await supabase
    .from('company_members')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-semibold tracking-tighter">{membership.name}</h1>
          <p className="text-zinc-500 mt-2">Company Overview</p>
        </div>

        {membership.role !== 'member' && (
          <Link
            href={`/dashboard/c/${companyId}/playbooks/new`}
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-medium hover:bg-zinc-200 transition"
          >
            <Plus className="w-5 h-5" />
            New Playbook
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-zinc-900 rounded-3xl p-8">
          <BookOpen className="w-8 h-8 text-emerald-400 mb-4" />
          <div className="text-5xl font-semibold">{playbookCount || 0}</div>
          <div className="text-zinc-400">Active Playbooks</div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8">
          <Users className="w-8 h-8 text-blue-400 mb-4" />
          <div className="text-5xl font-semibold">{memberCount || 0}</div>
          <div className="text-zinc-400">Team Members</div>
        </div>
      </div>
    </div>
  );
}
