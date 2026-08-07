// components/layout/NavItem.tsx
// This component renders a navigation item for the KMS dashboard sidebar. 
// It highlights the active route and supports an optional collapsed state for the sidebar.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

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
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={[
        'flex items-center gap-3 py-2.5 text-sm border-l-2 transition-colors',
        collapsed ? 'px-3 justify-center border-l-0' : 'px-3',
        active
          ? 'border-white text-white bg-white/[0.04]'
          : 'border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]',
      ].join(' ')}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-80" />
      {!collapsed && <span className="tracking-tight truncate">{label}</span>}
    </Link>
  );
}
