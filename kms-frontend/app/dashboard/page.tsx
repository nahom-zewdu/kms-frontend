// app/dashboard/page.tsx
// This is the main dashboard page for the KMS frontend application. 
// It fetches the latest active playbooks from Supabase and displays them in a list, along with some quick stats about the onboarding process. 
// Each playbook item links to its respective onboarding page where users can view the playbook details and interact with it. 
// The dashboard provides an overview of the team's onboarding status and allows for easy navigation to active playbooks and analytics.

import { getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';

export default async function DashboardPage() {
  const userContext = await getUserContext();

  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-semibold tracking-tighter">Dashboard</h1>
          <p className="text-zinc-400 mt-2">Welcome back</p>
        </div>

        <div className="text-right">
          <div className="text-sm text-zinc-500">Current Plan</div>
          <div className="text-lg font-medium">{userContext?.plan.toUpperCase()} • {userContext?.activePlaybooks}/{userContext?.maxPlaybooks} playbooks</div>
        </div>
      </div>

      {/* New Playbook Button */}
      <div className="mb-10">
        <Link
          href="/dashboard/new-playbook"
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-medium hover:bg-zinc-200 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Onboarding Playbook
        </Link>
      </div>

      {/* Active Playbooks */}
      <div className="bg-zinc-900 rounded-3xl p-8">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-medium">Active Onboardings</h2>
          <span className="text-sm text-zinc-500">{playbooks?.length || 0} total</span>
        </div>

        {playbooks && playbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playbooks.map((p: any) => (
              <Link
                key={p.id}
                href={`/onboard/${p.role}`}
                className="block bg-zinc-950 hover:bg-zinc-900 rounded-2xl p-6 transition-all group"
              >
                <div className="font-medium text-lg">{p.title}</div>
                <div className="text-sm text-zinc-500 mt-1">
                  {p.generated_for ? `For ${p.generated_for}` : 'New Hire'} • {new Date(p.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 py-12 text-center">No active playbooks yet. Create your first one above.</p>
        )}
      </div>
    </div>
  );
}
