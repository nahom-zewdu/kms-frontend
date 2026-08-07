// components/layout/DashboardShell.tsx
// This component defines the main layout for the KMS dashboard, including the global sidebar and the main content area. 
// It checks if the current route is a company-specific route and renders the appropriate layout accordingly.

'use client';

import { usePathname } from 'next/navigation';
import { GlobalSidebar } from '@/components/layout/GlobalSidebar';

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
  // Company routes render their own full shell in company layout
  const isCompanyRoute = /^\/dashboard\/c\/[^/]+/.test(pathname);

  if (isCompanyRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-zinc-100">
      <GlobalSidebar companies={companies} userEmail={userEmail} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
