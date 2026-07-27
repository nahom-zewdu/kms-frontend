// app/dashboard/c/[companyId]/page.tsx
// This is the layout for a specific company's dashboard section in the KMS application.
// It fetches the user context and checks if the user has access to the specified company.

import { getUserContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CompanySidebar } from '@/components/layout/CompanySidebar';

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const user = await getUserContext();

  if (!user) redirect('/login');

  const membership = user.companies.find(c => c.id === companyId);
  if (!membership) redirect('/dashboard');

  // Set active company cookie (server-side)

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <CompanySidebar companyId={companyId} companyName={membership.name} role={membership.role} />
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
