// components/layout/sidebar-state.ts
// This hook manages the collapsed state of the sidebar in the KMS dashboard.
// It uses localStorage to persist the state across sessions.
'use client';

import { useEffect, useState } from 'react';

const KEY = 'kms.sidebar.collapsed';

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(KEY) === '1');
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(KEY, next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  return { collapsed, toggle };
}
