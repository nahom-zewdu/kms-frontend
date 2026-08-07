// components/layout/GlobalSidebar.tsx
// This component renders the global sidebar for the KMS dashboard, which includes navigation links for the overview, companies, and account settings. 
// It also manages the collapsed state of the sidebar and handles user logout.
'use client';

import Link from 'next/link';
import { Home, Building2, Plus, CreditCard, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import { NavItem } from './NavItem';
import { useSidebarCollapsed } from './sidebar-state';
import { usePathname } from 'next/navigation';

type Company = { id: string; name: string; role: string };

export function GlobalSidebar({
  companies,
  userEmail,
}: {
  companies: Company[];
  userEmail?: string;
}) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const pathname = usePathname();

  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      window.location.href = body.redirect || '/login';
    } catch {
      window.location.href = '/login';
    }
  }

  return (
    <aside
      className={[
        'shrink-0 border-r border-zinc-900 bg-[#080808] flex flex-col min-h-screen transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64',
      ].join(' ')}
    >
      <div className={['py-6 flex items-center', collapsed ? 'px-3 justify-center' : 'px-5 justify-between'].join(' ')}>
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-semibold tracking-tighter text-white">
            KMS
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

      <nav className="flex-1 px-2 space-y-6">
        <div>
          <NavItem href="/dashboard" label="Overview" icon={Home} exact collapsed={collapsed} />
        </div>

        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[11px] uppercase tracking-widest text-zinc-600">
              Companies
            </div>
          )}
          <div className="space-y-0.5">
            {companies.map((c) => {
              const href = `/dashboard/c/${c.id}`;
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={c.id}
                  href={href}
                  title={collapsed ? c.name : undefined}
                  className={[
                    'block text-sm border-l-2 transition-colors truncate',
                    collapsed ? 'px-2 py-2 text-center border-l-0' : 'px-3 py-2',
                    active ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200',
                  ].join(' ')}
                >
                  {collapsed ? c.name.slice(0, 1).toUpperCase() : (
                    <>
                      <div className="font-medium tracking-tight truncate">{c.name}</div>
                      <div className="text-[11px] text-zinc-600 capitalize">{c.role}</div>
                    </>
                  )}
                </Link>
              );
            })}
            <Link
              href="/dashboard/companies/new"
              title={collapsed ? 'New company' : undefined}
              className={[
                'flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 border-l-2 border-transparent',
                collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
              ].join(' ')}
            >
              <Plus className="w-3.5 h-3.5" />
              {!collapsed && 'New company'}
            </Link>
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="px-3 mb-2 text-[11px] uppercase tracking-widest text-zinc-600">
              Account
            </div>
          )}
          <NavItem href="/dashboard/subscription" label="Plan" icon={CreditCard} collapsed={collapsed} />
          <NavItem href="/dashboard/settings" label="Settings" icon={Building2} collapsed={collapsed} />
        </div>
      </nav>

      <div className={['py-6 border-t border-zinc-900', collapsed ? 'px-2' : 'px-5'].join(' ')}>
        {!collapsed && userEmail && (
          <div className="text-xs text-zinc-600 truncate mb-3">{userEmail}</div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className={[
            'flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 w-full',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut className="w-3.5 h-3.5" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
