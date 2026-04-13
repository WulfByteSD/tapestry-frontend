'use client';

import { useCallback, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ListWindow = { key: 'list'; label: 'Items'; isDirty?: never };
/** A tab for an unsaved draft. Key is a UUID so many can coexist. */
type NewWindow = { key: string; label: 'New Item'; isNew: true; isDirty: boolean };
type ExistingWindow = { key: string; label: string; id: string; isDirty: boolean };

export type ItemWindowEntry = ListWindow | NewWindow | ExistingWindow;

const LIST_WINDOW: ListWindow = { key: 'list', label: 'Items' };

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useItemWindows() {
  const [windows, setWindows] = useState<ItemWindowEntry[]>([LIST_WINDOW]);
  const [activeKey, setActiveKey] = useState<string>('list');
  const [pendingClose, setPendingClose] = useState<string | null>(null);

  // Refs so callbacks always see current state without stale closures.
  const windowsRef = useRef(windows);
  windowsRef.current = windows;
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;

  // -------------------------------------------------------------------------
  // Internal: remove a window unconditionally and update active key
  // -------------------------------------------------------------------------
  const removeWindow = useCallback((key: string) => {
    const prev = windowsRef.current;
    const idx = prev.findIndex((w) => w.key === key);
    if (idx < 0 || prev[idx]?.key === 'list') return;

    const next = prev.filter((_, i) => i !== idx);
    // Fall back to the tab immediately to the left, or 'list'
    const fallbackKey = next[Math.max(0, idx - 1)]?.key ?? 'list';

    setWindows(next);
    if (activeKeyRef.current === key) {
      setActiveKey(fallbackKey);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Open an existing item — idempotent.
  // Pass background=true to add the tab without switching focus to it.
  // -------------------------------------------------------------------------
  const openExisting = useCallback((id: string, name: string, background = false) => {
    const alreadyOpen = windowsRef.current.some((w) => w.key === id);
    if (!alreadyOpen) {
      setWindows((prev) => [...prev, { key: id, label: name, id, isDirty: false } satisfies ExistingWindow]);
    }
    if (!background) {
      setActiveKey(id);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Open a new draft tab — each call creates an independent tab with a UUID key.
  // Pass background=true to add the tab without switching focus to it.
  // -------------------------------------------------------------------------
  const openNew = useCallback((background = false) => {
    const key = crypto.randomUUID();
    setWindows((prev) => [...prev, { key, label: 'New Item', isNew: true, isDirty: false } satisfies NewWindow]);
    if (!background) {
      setActiveKey(key);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Close a window — if dirty and not forced, queues a confirmation instead
  // -------------------------------------------------------------------------
  const closeWindow = useCallback(
    (key: string, force = false) => {
      const win = windowsRef.current.find((w) => w.key === key);
      if (!win || win.key === 'list') return;

      if (!force && win.isDirty) {
        setPendingClose(key);
        return;
      }

      removeWindow(key);
    },
    [removeWindow]
  );

  // -------------------------------------------------------------------------
  // Update the dirty flag for a specific window
  // -------------------------------------------------------------------------
  const setWindowDirty = useCallback((key: string, isDirty: boolean) => {
    setWindows((prev) =>
      prev.map((w): ItemWindowEntry => {
        if (w.key === key && w.key !== 'list') return { ...w, isDirty };
        return w;
      })
    );
  }, []);

  // -------------------------------------------------------------------------
  // After creating a new item: promote the draft tab (by its UUID key) to a
  // real item tab keyed on the server-assigned id.
  // -------------------------------------------------------------------------
  const replaceNew = useCallback((windowKey: string, id: string, name: string) => {
    setWindows((prev) => prev.map((w): ItemWindowEntry => (w.key === windowKey ? { key: id, label: name, id, isDirty: false } : w)));
    setActiveKey(id);
  }, []);

  // -------------------------------------------------------------------------
  // Dirty-close confirmation
  // -------------------------------------------------------------------------
  const confirmClose = useCallback(() => {
    if (!pendingClose) return;
    const key = pendingClose;
    setPendingClose(null);
    removeWindow(key);
  }, [pendingClose, removeWindow]);

  const cancelClose = useCallback(() => {
    setPendingClose(null);
  }, []);

  return {
    windows,
    activeKey,
    setActiveKey,
    pendingClose,
    openExisting,
    openNew,
    closeWindow,
    setWindowDirty,
    replaceNew,
    confirmClose,
    cancelClose,
  };
}
