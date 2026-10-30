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
import { useSidebarCollapsed, useSidebarUi } from './sidebar-state';

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
  const { closeMobile } = useSidebarUi();
  const base = `/dashboard/c/${companyId}`;
  const canManage = role === 'admin' || role === 'manager';

  return (
    <aside
      className={[
        'flex h-full min-h-dvh w-64 shrink-0 flex-col border-r border-zinc-900 bg-[#080808] transition-[width] duration-200',
        collapsed ? 'lg:w-[72px]' : 'lg:w-64',
      ].join(' ')}
    >
      <div className={['border-b border-zinc-900 py-4', collapsed ? 'px-2' : 'px-4'].join(' ')}>
        <div className={['mb-3 flex items-center', collapsed ? 'justify-center' : 'justify-between lg:justify-between'].join(' ')}>
          {!collapsed && (
            <Link
              href="/dashboard"
              onClick={closeMobile}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300"
            >
              <ArrowLeft className="h-3 w-3" />
              All companies
            </Link>
          )}
          <button
            type="button"
            onClick={toggle}
            className="hidden h-9 w-9 items-center justify-center text-zinc-500 hover:text-zinc-200 lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
        {!collapsed && (
          <>
            <div className="truncate text-base font-semibold tracking-tight text-white">
              {companyName}
            </div>
            <div className="mt-0.5 text-[11px] capitalize text-zinc-600">{role}</div>
          </>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            title="All companies"
            aria-label="All companies"
            onClick={closeMobile}
            className="flex justify-center text-zinc-500 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
      </div>

      <nav aria-label="Company navigation" className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
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
