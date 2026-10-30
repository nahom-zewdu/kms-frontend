'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useSidebarUi } from './sidebar-state';

export function AppShell({
  sidebar,
  mobileTitle = 'KMS',
  children,
}: {
  sidebar: React.ReactNode;
  mobileTitle?: string;
  children: React.ReactNode;
}) {
  const { mobileOpen, openMobile, closeMobile } = useSidebarUi();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="flex min-h-dvh bg-[#0a0a0a] text-zinc-100">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-label="Close navigation"
          onClick={closeMobile}
        />
      )}

      <div
        id="app-navigation"
        className={[
          'fixed inset-y-0 left-0 z-50 flex max-w-[calc(100vw-2.75rem)] transition-transform duration-200 lg:static lg:z-auto lg:max-w-none lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-zinc-900 bg-[#0a0a0a] px-3 lg:hidden">
          <button
            type="button"
            onClick={openMobile}
            className="inline-flex h-9 w-9 items-center justify-center text-zinc-400 hover:text-white"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            aria-controls="app-navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/dashboard"
            className="truncate text-sm font-semibold tracking-tight text-white"
          >
            {mobileTitle}
          </Link>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
