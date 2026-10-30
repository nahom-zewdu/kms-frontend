'use client';

import { usePathname } from 'next/navigation';
import { GlobalSidebar } from '@/components/layout/GlobalSidebar';
import { AppShell } from '@/components/layout/AppShell';
import { SidebarProvider } from '@/components/layout/sidebar-state';

type Company = { id: string; name: string; role: string };

export function DashboardShell({
  children,
  companies,
  userEmail,
}: {
  children: React.ReactNode;
  companies: Company[];
  userEmail?: string;
}) {
  const pathname = usePathname();
  const isCompanyRoute = /^\/dashboard\/c\/[^/]+/.test(pathname);

  if (isCompanyRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppShell sidebar={<GlobalSidebar companies={companies} userEmail={userEmail} />}>
        {children}
      </AppShell>
    </SidebarProvider>
  );
}
