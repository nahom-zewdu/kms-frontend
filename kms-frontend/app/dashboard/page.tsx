// app/dashboard/page.tsx
// This is the main dashboard page for the KMS application.
// It displays the user's companies and allows them to create a new company or switch between existing ones.
// It uses the getUserContext function to fetch user information and company memberships.

import { getUserContext } from '@/lib/auth';
import Link from 'next/link';
import { Plus, Building2 } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getUserContext();
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-semibold tracking-tighter">Your Companies</h1>
          <p className="text-zinc-500 mt-2">Select a company to manage</p>
        </div>

        <Link
          href="/dashboard/companies/new"
          className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-medium hover:bg-zinc-200 transition"
        >
          <Plus className="w-5 h-5" />
          Create Company
        </Link>
      </div>

      {user.companies.length === 0 ? (
        <div className="bg-zinc-900 rounded-3xl p-16 text-center">
          <Building2 className="w-12 h-12 mx-auto text-zinc-600 mb-6" />
          <h2 className="text-2xl font-medium mb-2">No companies yet</h2>
          <p className="text-zinc-500 mb-8">Create your first company to get started</p>
          <Link
            href="/dashboard/companies/new"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-medium"
          >
            Create Company
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.companies.map((company) => (
            <Link
              key={company.id}
              href={`/dashboard/c/${company.id}`}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-8 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-medium">{company.name}</h3>
                  <p className="text-sm text-zinc-500 mt-2 capitalize">
                    {company.role} {company.is_owner && '• Owner'}
                  </p>
                </div>
                <Building2 className="w-6 h-6 text-zinc-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
