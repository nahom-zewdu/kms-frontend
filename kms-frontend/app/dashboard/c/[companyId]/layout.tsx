import { getUserContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CompanyShell } from '@/components/layout/CompanyShell';

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

  const membership = user.companies.find((c) => c.id === companyId);
  if (!membership) redirect('/dashboard');

  return (
    <CompanyShell
      companyId={companyId}
      companyName={membership.name}
      role={membership.role}
    >
      {children}
    </CompanyShell>
  );
}
