'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const KEY = 'kms.sidebar.collapsed';

type SidebarUi = {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarUiContext = createContext<SidebarUi | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({ collapsed, toggle, mobileOpen, openMobile, closeMobile }),
    [collapsed, toggle, mobileOpen, openMobile, closeMobile]
  );

  return <SidebarUiContext.Provider value={value}>{children}</SidebarUiContext.Provider>;
}

export function useSidebarUi() {
  const context = useContext(SidebarUiContext);
  if (!context) {
    throw new Error('useSidebarUi must be used within SidebarProvider');
  }
  return context;
}

export function useSidebarCollapsed() {
  const { collapsed, toggle, mobileOpen } = useSidebarUi();
  return {
    collapsed: collapsed && !mobileOpen,
    toggle,
  };
}
