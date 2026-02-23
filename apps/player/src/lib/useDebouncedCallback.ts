"use client";

import { useCallback, useEffect, useRef } from "react";

type AnyFn = (...args: any[]) => void;

export function useDebouncedCallback<T extends AnyFn>(fn: T, delayMs: number) {
  const fnRef = useRef(fn);
  const timerRef = useRef<number | null>(null);
  const lastArgsRef = useRef<any[] | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (lastArgsRef.current) {
      fnRef.current(...(lastArgsRef.current as any[]));
      lastArgsRef.current = null;
    }
  }, []);

  const call = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (lastArgsRef.current) {
          fnRef.current(...(lastArgsRef.current as any[]));
          lastArgsRef.current = null;
        }
      }, delayMs);
    },
    [delayMs],
  );

  return { call, flush, cancel };
}
