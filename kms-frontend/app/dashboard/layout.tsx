// app/dashboard/layout.tsx
// This is the main layout component for the dashboard section of the KMS frontend application. 
// It defines the overall structure and styling for all pages within the dashboard, including a sidebar for navigation and a main content area where individual pages will be rendered. 
// The layout uses a dark background color and ensures that the main content area takes up the remaining space next to the sidebar. 
// By wrapping the children components with this layout, we can maintain a consistent look and feel across all dashboard pages while allowing for dynamic content to be displayed in the main area.

import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}
