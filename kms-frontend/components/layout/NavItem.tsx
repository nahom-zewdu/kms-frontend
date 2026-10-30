'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { useSidebarUi } from './sidebar-state';

export function NavItem({
  href,
  label,
  icon: Icon,
  exact = false,
  collapsed = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const { closeMobile } = useSidebarUi();
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      onClick={closeMobile}
      className={[
        'flex min-h-10 items-center gap-3 py-2 text-sm border-l-2 transition-colors',
        collapsed ? 'justify-center px-2 border-l-0' : 'px-3',
        active
          ? 'border-white text-white bg-white/[0.04]'
          : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]',
      ].join(' ')}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      {!collapsed && <span className="truncate tracking-tight">{label}</span>}
    </Link>
  );
}
