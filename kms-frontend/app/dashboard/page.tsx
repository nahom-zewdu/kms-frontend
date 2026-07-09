// app/dashboard/page.tsx
// This is the main page component for the dashboard section of the KMS frontend application. 
// It fetches user context and active playbooks from the Supabase database, and displays a welcome message, statistics cards, and a list of active playbooks. 
// The page includes a header with a "New Onboarding" button that navigates to the new playbook creation page. 
// The statistics cards show the total number of active playbooks, team members, and recent events. 
// The active playbooks section displays a grid of cards for each active playbook, allowing users to navigate to the specific onboarding page for each role. 
// If there are no active playbooks, a message is displayed prompting the user to create their first one.

import { getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Plus, Play, Users, TrendingUp, BookOpen } from 'lucide-react';

export default async function DashboardPage() {
  const userContext = await getUserContext();

  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8);

  const { count: totalPlaybooks } = await supabase
    .from('playbooks')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-6xl font-semibold tracking-tighter">Dashboard</h1>
          <p className="text-zinc-500 mt-2">Welcome back, {userContext?.name || 'Team'}</p>
        </div>

        <Link
          href="/dashboard/new-playbook"
          className="inline-flex items-center gap-3 bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-2xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          New Onboarding
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 rounded-3xl p-8">
          <div className="flex items-center gap-4">
            <Play className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-5xl font-semibold">{totalPlaybooks || 0}</div>
              <div className="text-zinc-400">Active Playbooks</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-5xl font-semibold">12</div>
              <div className="text-zinc-400">Team Members</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-5xl font-semibold">8</div>
              <div className="text-zinc-400">Recent Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Playbooks */}
      <div className="bg-zinc-900 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-medium flex items-center gap-3">
            <BookOpen className="w-6 h-6" /> Active Onboardings
          </h2>
          <span className="text-sm text-zinc-500">{playbooks?.length || 0} total</span>
        </div>

        {playbooks && playbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playbooks.map((p: any) => (
              <Link
                key={p.id}
                href={`/onboard/${p.role}`}
                className="group bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-8 transition-all"
              >
                <div className="font-medium text-xl mb-2">{p.title}</div>
                <div className="text-sm text-zinc-500">
                  {p.generated_for ? `For ${p.generated_for}` : 'New Hire'}
                </div>
                <div className="text-xs text-zinc-500 mt-6">
                  Created {new Date(p.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            No active playbooks yet.<br />Create your first one above.
          </div>
        )}
      </div>
    </div>
  );
}
