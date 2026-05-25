// components/layout/Sidebar.tsx
// This component defines the sidebar navigation for the KMS dashboard.

'use client';

import { Home, Users, BookOpen, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <div className="w-72 border-r border-zinc-800 bg-zinc-950 p-6 flex-shrink-0">
      <div className="mb-12 flex items-center gap-3">
        <div className="w-7 h-7 bg-white rounded" />
        <span className="text-2xl font-semibold tracking-tighter">KMS</span>
      </div>

      <nav className="space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
          <Home className="w-4 h-4" />
          Overview
        </Link>
        <Link href="/dashboard/onboard" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
          <BookOpen className="w-4 h-4" />
          Active Playbooks
        </Link>
        <Link href="/dashboard/teams" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
          <Users className="w-4 h-4" />
          Teams
        </Link>
        <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
          <BarChart3 className="w-4 h-4" />
          Knowledge Health
        </Link>
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-900 rounded-2xl transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </nav>
    </div>
  );
}