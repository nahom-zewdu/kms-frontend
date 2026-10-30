'use client';

import { useEffect, useRef } from 'react';
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const menuButton = menuButtonRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const getFocusableElements = () =>
      Array.from(
        navigationRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);

    getFocusableElements()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobile();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
      } else if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (menuButton?.isConnected) {
        menuButton.focus();
      } else {
        previousFocus?.focus();
      }
    };
  }, [mobileOpen, closeMobile]);

  return (
    <div className="flex min-h-dvh bg-[#0a0a0a] text-zinc-100">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-hidden="true"
          tabIndex={-1}
          onClick={closeMobile}
        />
      )}

      <div
        ref={navigationRef}
        id="app-navigation"
        role={mobileOpen ? 'dialog' : undefined}
        aria-label={mobileOpen ? 'Main navigation' : undefined}
        aria-modal={mobileOpen ? true : undefined}
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
            ref={menuButtonRef}
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
