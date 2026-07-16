// app/dashboard/layout.tsx
// This is the layout for the dashboard section of the KMS application.

import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserContext();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}

