// app/dashboard/company/c/[companyId]/CompanySidebar.tsx
// This component renders the sidebar for a specific company's dashboard section in the KMS application.
// It displays the company name, the user's role within the company, and navigation links to different sections of the company's dashboard.
// The sidebar highlights the active link based on the current pathname and provides a link to return to the list of all companies.

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, BookOpen, Users, Settings, 
  GitBranch, MessageSquare, ArrowLeft 
} from 'lucide-react';

interface Props {
  companyId: string;
  companyName: string;
  role: string;
}

export function CompanySidebar({ companyId, companyName, role }: Props) {
  const pathname = usePathname();
  const base = `/dashboard/c/${companyId}`;

  const links = [
    { href: base, label: 'Overview', icon: Home },
    { href: `${base}/playbooks`, label: 'Playbooks', icon: BookOpen },
    { href: `${base}/members`, label: 'Members', icon: Users },
    { href: `${base}/integrations`, label: 'Integrations', icon: GitBranch },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-72 border-r border-zinc-800 bg-zinc-950 p-6 flex-shrink-0 flex flex-col">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" /> All Companies
        </Link>
        <div className="text-xl font-semibold tracking-tight">{companyName}</div>
        <div className="text-xs text-zinc-500 mt-1 capitalize">{role}</div>
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm rounded-2xl transition-all ${
                active ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
