import { getUserContext } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function PlaybooksPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();
  if (!user) return null;

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) return null;

  const supabase = await createServerSupabase();

  const { data: playbooks, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[company playbooks] failed to load:', error.message);
  }

  return (
    <div>
      <PageHeader
        title="Playbooks"
        description="Onboarding playbooks for this company."
        actions={
          membership.role !== 'member' ? (
            <Link href={`/dashboard/c/${companyId}/playbooks/new`} className="kms-btn-primary">
              <Plus className="h-4 w-4" />
              New playbook
            </Link>
          ) : undefined
        }
      />

      {error ? (
        <div role="alert" className="border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          Could not load playbooks. Refresh the page to try again.
        </div>
      ) : playbooks && playbooks.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
          {playbooks.map((playbook: { id: string; title: string; generated_for?: string; created_at: string; role: string }) => (
            <Link
              key={playbook.id}
              href={`/onboard/${encodeURIComponent(playbook.role)}`}
              className="kms-card min-w-0 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40 sm:p-5"
            >
              <div className="break-words text-base font-medium">{playbook.title}</div>
              <div className="mt-1 break-words text-sm text-zinc-500">
                {playbook.generated_for ? `For ${playbook.generated_for}` : 'New hire'}
              </div>
              <div className="mt-4 text-xs text-zinc-600">
                Created {new Date(playbook.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No playbooks yet"
          description="Create the first onboarding playbook for this company."
        />
      )}
    </div>
  );
}
