'use client';

import { AppShell } from '@/components/layout/AppShell';
import { CompanySidebar } from '@/components/layout/CompanySidebar';
import { SidebarProvider } from '@/components/layout/sidebar-state';

export function CompanyShell({
  companyId,
  companyName,
  role,
  children,
}: {
  companyId: string;
  companyName: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppShell
        mobileTitle={companyName}
        sidebar={
          <CompanySidebar companyId={companyId} companyName={companyName} role={role} />
        }
      >
        {children}
      </AppShell>
    </SidebarProvider>
  );
}
