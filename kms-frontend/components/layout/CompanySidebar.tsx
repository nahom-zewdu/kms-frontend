// components/layout/CompanySidebar.tsx
// This component renders the sidebar for a specific company's dashboard in the KMS application.
// It includes navigation links for the company's overview, first 7 days, members, analytics, and settings, depending on the user's role.
// The sidebar can be collapsed or expanded, and the state is managed using a custom hook that persists the state in localStorage.

'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Route,
} from 'lucide-react';
import { NavItem } from './NavItem';
import { useSidebarCollapsed } from './sidebar-state';

export function CompanySidebar({
  companyId,
  companyName,
  role,
}: {
  companyId: string;
  companyName: string;
  role: string;
}) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const base = `/dashboard/c/${companyId}`;
  const canManage = role === 'admin' || role === 'manager';

  return (
    <aside
      className={[
        'shrink-0 border-r border-zinc-900 bg-[#080808] flex flex-col min-h-screen transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64',
      ].join(' ')}
    >
      <div className={['py-6 border-b border-zinc-900', collapsed ? 'px-2' : 'px-5'].join(' ')}>
        <div className={['flex items-center mb-4', collapsed ? 'justify-center' : 'justify-between'].join(' ')}>
          {!collapsed && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300"
            >
              <ArrowLeft className="w-3 h-3" />
              All companies
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            className="p-2 text-zinc-500 hover:text-zinc-200"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <>
            <div className="text-lg font-semibold tracking-tighter text-white truncate">
              {companyName}
            </div>
            <div className="text-[11px] text-zinc-600 capitalize mt-0.5">{role}</div>
          </>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            title="All companies"
            className="flex justify-center text-zinc-500 hover:text-zinc-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <nav className="flex-1 px-2 py-6 space-y-0.5">
        <NavItem href={base} label="Overview" icon={Home} exact collapsed={collapsed} />
        <NavItem href={`${base}/ramp`} label="First 7 Days" icon={Route} collapsed={collapsed} />
        <NavItem href={`${base}/playbooks`} label="Playbooks" icon={BookOpen} collapsed={collapsed} />
        {canManage && (
          <NavItem href={`${base}/members`} label="Members" icon={Users} collapsed={collapsed} />
        )}
        <NavItem href={`${base}/analytics`} label="Knowledge Health" icon={BarChart3} collapsed={collapsed} />
        {role === 'admin' && (
          <NavItem href={`${base}/settings`} label="Settings" icon={Settings} collapsed={collapsed} />
        )}
      </nav>
    </aside>
  );
}
