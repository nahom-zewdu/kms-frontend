// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserContext();
  if (!user) redirect('/login');

  return (
    <DashboardShell
      companies={user.companies || []}
      userEmail={user.email}
    >
      {children}
    </DashboardShell>
  );
}
