// app/dashboard/page.tsx
// This is the main dashboard page for the KMS frontend application. 
// It fetches the latest active playbooks from Supabase and displays them in a list, along with some quick stats about the onboarding process. 
// Each playbook item links to its respective onboarding page where users can view the playbook details and interact with it. 
// The dashboard provides an overview of the team's onboarding status and allows for easy navigation to active playbooks and analytics.

import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function DashboardPage() {
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-semibold tracking-tighter">Dashboard</h1>
          <p className="text-zinc-400 mt-2">Overview of your team's onboarding</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-zinc-500">Current Plan</div>
          <div className="text-lg font-medium">Starter • 3 active playbooks</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Playbooks */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-3xl p-8">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-medium">Active Onboardings</h2>
            <Link href="/dashboard/onboard" className="text-sm text-zinc-400 hover:text-white">
              View all →
            </Link>
          </div>

          {playbooks && playbooks.length > 0 ? (
            <div className="space-y-4">
              {playbooks.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/onboard/${p.role}`}
                  className="block bg-zinc-950 hover:bg-zinc-900 rounded-2xl p-6 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-zinc-500 mt-1">
                        Generated for {p.generated_for || 'New Hire'} • {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs px-3 py-1 bg-zinc-800 rounded-full">Active</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No active playbooks yet.</p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-zinc-900 rounded-3xl p-8 space-y-8">
          <div>
            <div className="text-sm text-zinc-500">Average Ramp-up Time</div>
            <div className="text-5xl font-semibold tracking-tighter mt-2">6.4 days</div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">Knowledge Health</div>
            <div className="text-5xl font-semibold tracking-tighter mt-2 text-emerald-400">Good</div>
          </div>
        </div>
      </div>
    </div>
  );
}
