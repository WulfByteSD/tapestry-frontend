'use client';

import { useCallback, useRef, useState } from 'react';

type ListWindow = { key: 'list'; label: 'Resources'; isDirty?: never };
type NewWindow = { key: string; label: 'New Resource'; isNew: true; isDirty: boolean };
type ExistingWindow = { key: string; label: string; id: string; isDirty: boolean };

export type ResourceWindowEntry = ListWindow | NewWindow | ExistingWindow;

const LIST_WINDOW: ListWindow = { key: 'list', label: 'Resources' };

function getDraftKey() {
  return crypto.randomUUID();
}

export function useResourceWindows() {
  const [windows, setWindows] = useState<ResourceWindowEntry[]>([LIST_WINDOW]);
  const [activeKey, setActiveKey] = useState<string>('list');
  const [pendingClose, setPendingClose] = useState<string | null>(null);

  const windowsRef = useRef(windows);
  windowsRef.current = windows;
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;

  const removeWindow = useCallback((key: string) => {
    const prev = windowsRef.current;
    const idx = prev.findIndex((windowEntry) => windowEntry.key === key);
    if (idx < 0 || prev[idx]?.key === 'list') return;

    const next = prev.filter((_, index) => index !== idx);
    const fallbackKey = next[Math.max(0, idx - 1)]?.key ?? 'list';

    setWindows(next);
    if (activeKeyRef.current === key) {
      setActiveKey(fallbackKey);
    }
  }, []);

  const openExisting = useCallback((id: string, label: string, background = false) => {
    const alreadyOpen = windowsRef.current.some((windowEntry) => windowEntry.key === id);
    if (!alreadyOpen) {
      setWindows((prev) => [...prev, { key: id, label, id, isDirty: false } satisfies ExistingWindow]);
    }

    if (!background) {
      setActiveKey(id);
    }
  }, []);

  const openNew = useCallback((background = false) => {
    const key = getDraftKey();
    setWindows((prev) => [...prev, { key, label: 'New Resource', isNew: true, isDirty: false } satisfies NewWindow]);

    if (!background) {
      setActiveKey(key);
    }
  }, []);

  const closeWindow = useCallback(
    (key: string, force = false) => {
      const windowEntry = windowsRef.current.find((entry) => entry.key === key);
      if (!windowEntry || windowEntry.key === 'list') return;

      if (!force && windowEntry.isDirty) {
        setPendingClose(key);
        return;
      }

      removeWindow(key);
    },
    [removeWindow]
  );

  const setWindowDirty = useCallback((key: string, isDirty: boolean) => {
    setWindows((prev) => {
      let changed = false;

      const next = prev.map((windowEntry): ResourceWindowEntry => {
        if (windowEntry.key === key && windowEntry.key !== 'list') {
          if (windowEntry.isDirty === isDirty) {
            return windowEntry;
          }

          changed = true;
          return { ...windowEntry, isDirty } as ResourceWindowEntry;
        }

        return windowEntry;
      });

      return changed ? next : prev;
    });
  }, []);

  const replaceNew = useCallback((windowKey: string, id: string, label: string) => {
    setWindows((prev) => {
      const existingIndex = prev.findIndex((windowEntry) => windowEntry.key === id);

      if (existingIndex >= 0) {
        return prev
          .filter((windowEntry) => windowEntry.key !== windowKey)
          .map((windowEntry): ResourceWindowEntry => {
            if (windowEntry.key === id && windowEntry.key !== 'list') {
              return { ...windowEntry, label, isDirty: false } as ResourceWindowEntry;
            }

            return windowEntry;
          });
      }

      return prev.map((windowEntry): ResourceWindowEntry => {
        if (windowEntry.key === windowKey) {
          return { key: id, label, id, isDirty: false };
        }

        return windowEntry;
      });
    });

    setActiveKey(id);
  }, []);

  const renameWindow = useCallback((key: string, label: string) => {
    setWindows((prev) => {
      let changed = false;

      const next = prev.map((windowEntry): ResourceWindowEntry => {
        if (windowEntry.key === key && windowEntry.key !== 'list') {
          if (windowEntry.label === label) {
            return windowEntry;
          }

          changed = true;
          return { ...windowEntry, label } as ResourceWindowEntry;
        }

        return windowEntry;
      });

      return changed ? next : prev;
    });
  }, []);

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
    renameWindow,
    confirmClose,
    cancelClose,
  };
}
