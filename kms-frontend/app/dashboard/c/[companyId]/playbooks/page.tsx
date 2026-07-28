// app/dashboard/c/[companyId]/playbooks/page.tsx
// This page displays the list of active playbooks for a specific company in the KMS application.
// It fetches the user context to determine if the user has access to the company and whether they have permissions to create new playbooks.

import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';

export default async function PlaybooksPage({
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

  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-semibold tracking-tighter">Playbooks</h1>
          <p className="text-zinc-500 mt-2">Onboarding playbooks for this company</p>
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

      {playbooks && playbooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playbooks.map((p: any) => (
            <Link
              key={p.id}
              href={`/onboard/${p.role}`}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-8 transition-all"
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
        <div className="bg-zinc-900 rounded-3xl p-16 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-zinc-600 mb-6" />
          <h2 className="text-2xl font-medium mb-2">No playbooks yet</h2>
          <p className="text-zinc-500">Create the first onboarding playbook for this company</p>
        </div>
      )}
    </div>
  );
}
