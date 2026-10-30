import { getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { Plus, Building2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function DashboardPage() {
  const user = await getUserContext();
  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Select a company to manage onboarding paths."
        actions={
          <Link href="/dashboard/companies/new" className="kms-btn-primary">
            <Plus className="h-4 w-4" />
            Create company
          </Link>
        }
      />

      {user.companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Create your first company to start a first-week path."
          action={
            <Link href="/dashboard/companies/new" className="kms-btn-primary">
              Create company
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {user.companies.map((company) => (
            <Link
              key={company.id}
              href={`/dashboard/c/${company.id}`}
              className="kms-card p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium text-white">{company.name}</h2>
                  <p className="mt-1 text-sm capitalize text-zinc-500">
                    {company.role} {company.is_owner && '· Owner'}
                  </p>
                </div>
                <Building2 className="h-4 w-4 shrink-0 text-zinc-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
