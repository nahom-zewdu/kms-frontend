'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ReactNode } from 'react';

const KEY = 'kms.sidebar.collapsed';
const CHANGE_EVENT = 'kms-sidebar-collapsed-change';

let collapsedSnapshot: boolean | undefined;

function getCollapsedSnapshot() {
  if (collapsedSnapshot === undefined) {
    try {
      collapsedSnapshot = localStorage.getItem(KEY) === '1';
    } catch {
      collapsedSnapshot = false;
    }
  }
  return collapsedSnapshot;
}

function subscribeToCollapsedChange(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY && event.key !== null) return;
    collapsedSnapshot = event.newValue === '1';
    onChange();
  };

  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getServerCollapsedSnapshot() {
  return false;
}

type SidebarUi = {
  collapsed: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarUiContext = createContext<SidebarUi | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeToCollapsedChange,
    getCollapsedSnapshot,
    getServerCollapsedSnapshot
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    const next = !getCollapsedSnapshot();
    collapsedSnapshot = next;
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
      // Keep the in-memory preference for this session when storage is unavailable.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
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
