'use client';

import Link from 'next/link';
import { Home, Plus, CreditCard, LogOut, PanelLeftClose, PanelLeft, Settings } from 'lucide-react';
import { NavItem } from './NavItem';
import { useSidebarCollapsed, useSidebarUi } from './sidebar-state';
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
  const { closeMobile } = useSidebarUi();
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
        'flex h-full min-h-dvh w-64 shrink-0 flex-col border-r border-zinc-900 bg-[#080808] transition-[width] duration-200',
        collapsed ? 'lg:w-[72px]' : 'lg:w-64',
      ].join(' ')}
    >
      <div
        className={[
          'hidden items-center py-5 lg:flex',
          collapsed ? 'px-2 justify-center' : 'px-3 justify-between',
        ].join(' ')}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className="text-lg font-semibold tracking-tight text-white"
          >
            KMS
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

      <nav aria-label="Global navigation" className="flex-1 space-y-6 overflow-y-auto px-2 pb-4">
        <div>
          <NavItem href="/dashboard" label="Overview" icon={Home} exact collapsed={collapsed} />
        </div>

        <div>
          {!collapsed && (
            <div className="mb-2 px-3 text-[11px] uppercase tracking-widest text-zinc-600">
              Companies
            </div>
          )}
          <div className="space-y-0.5">
            {companies.map((company) => {
              const href = `/dashboard/c/${company.id}`;
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={company.id}
                  href={href}
                  title={collapsed ? company.name : undefined}
                  aria-label={collapsed ? company.name : undefined}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMobile}
                  className={[
                    'block truncate border-l-2 text-sm transition-colors',
                    collapsed ? 'border-l-0 px-2 py-2.5 text-center' : 'px-3 py-2',
                    active
                      ? 'border-white text-white'
                      : 'border-transparent text-zinc-500 hover:text-zinc-200',
                  ].join(' ')}
                >
                  {collapsed ? (
                    company.name.slice(0, 1).toUpperCase()
                  ) : (
                    <>
                      <div className="truncate font-medium tracking-tight">{company.name}</div>
                      <div className="text-[11px] capitalize text-zinc-600">{company.role}</div>
                    </>
                  )}
                </Link>
              );
            })}
            <Link
              href="/dashboard/companies/new"
              title={collapsed ? 'New company' : undefined}
              aria-label={collapsed ? 'New company' : undefined}
              aria-current={pathname === '/dashboard/companies/new' ? 'page' : undefined}
              onClick={closeMobile}
              className={[
                'flex min-h-10 items-center gap-2 border-l-2 border-transparent text-sm text-zinc-500 hover:text-zinc-200',
                collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
              ].join(' ')}
            >
              <Plus className="h-3.5 w-3.5" />
              {!collapsed && 'New company'}
            </Link>
          </div>
        </div>

        <div>
          {!collapsed && (
            <div className="mb-2 px-3 text-[11px] uppercase tracking-widest text-zinc-600">
              Account
            </div>
          )}
          <NavItem href="/dashboard/subscription" label="Plan" icon={CreditCard} collapsed={collapsed} />
          <NavItem href="/dashboard/settings" label="Settings" icon={Settings} collapsed={collapsed} />
        </div>
      </nav>

      <div className={['border-t border-zinc-900 py-4', collapsed ? 'px-2' : 'px-4'].join(' ')}>
        {!collapsed && userEmail && (
          <div className="mb-3 truncate text-xs text-zinc-600">{userEmail}</div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          aria-label={collapsed ? 'Sign out' : undefined}
          className={[
            'flex min-h-10 w-full items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
