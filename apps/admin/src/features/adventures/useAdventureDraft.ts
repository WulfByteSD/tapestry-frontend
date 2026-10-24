'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { adventureApi } from './adventure.api';
import { emptyContent, errorMessage, fingerprint, uncertainWrite, validateContent } from './adventure.helpers';
import type { Adventure, AdventureContent } from './adventure.types';

type Recovery = { content: AdventureContent; libraryResourceId: string; revision?: number; uncertain?: boolean };

export function useAdventureDraft(initial: Adventure | undefined, userId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [record, setRecord] = useState(initial);
  const [content, setContent] = useState<AdventureContent>(initial ?? emptyContent);
  const [libraryResourceId, setLibraryResourceId] = useState(initial?.libraryResourceId ?? '');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [recovery, setRecovery] = useState<Recovery | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [destination, setDestination] = useState<string | null>(null);
  const [latest, setLatest] = useState<Adventure | null>(null);
  const storageKey = `tapestry-adventure:${userId}:${initial?.id ?? 'new'}`;
  const dirty = fingerprint(content) !== fingerprint(record ?? emptyContent()) || (!record && !!libraryResourceId);
  const issues = validateContent(content);

  useEffect(() => {
    // Hydrate a recoverable draft only after mount; never put private drafts in SSR HTML.
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const value = JSON.parse(raw) as Recovery;
        if (value.content && Array.isArray(value.content.sections) && Array.isArray(value.content.resources) && Array.isArray(value.content.encounters)) {
          fingerprint(value.content); // Reject malformed/obsolete cached shapes without crashing the editor.
          setRecovery(value);
        }
      }
    } catch { setStorageError(true); }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready || recovery) return;
    try {
      if (dirty || blocked) sessionStorage.setItem(storageKey, JSON.stringify({ content, libraryResourceId, revision: record?.revision, uncertain: blocked } satisfies Recovery));
      else sessionStorage.removeItem(storageKey);
    } catch {
      setStorageError(true);
    }
  }, [blocked, content, dirty, libraryResourceId, ready, record?.revision, recovery, storageKey]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty || busyRef.current || blocked || recovery) { event.preventDefault(); event.returnValue = ''; } };
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      if ((dirty || busyRef.current || blocked || recovery) && link.href !== window.location.href && !link.getAttribute('href')?.startsWith('#')) {
        event.preventDefault(); event.stopPropagation(); setDestination(link.href);
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', click, true); };
  }, [blocked, dirty, recovery]);

  const accept = (next: Adventure) => {
    setRecord(next); setContent(next); setLibraryResourceId(next.libraryResourceId);
    queryClient.setQueryData(['adventures', 'detail', next.id, userId], next);
    void queryClient.invalidateQueries({ queryKey: ['adventures', 'list'] });
  };

  const mutate = async (operation: () => Promise<Adventure | void>, success: string) => {
    if (busyRef.current || blocked || recovery) return false;
    busyRef.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const result = await operation();
      if (result) accept(result);
      else {
        try { sessionStorage.removeItem(storageKey); } catch { /* Do not misreport a confirmed deletion. */ }
        void queryClient.invalidateQueries({ queryKey: ['adventures'] });
        router.replace('/adventures');
      }
      setNotice(success);
      return true;
    } catch (failure) {
      setError(errorMessage(failure));
      if (uncertainWrite(failure)) {
        setBlocked(true);
        // Preserve uncertain outcomes across navigation; do not invite blind create/upload retries.
        try { sessionStorage.setItem(storageKey, JSON.stringify({ content, libraryResourceId, revision: record?.revision, uncertain: true } satisfies Recovery)); } catch { setStorageError(true); }
      }
      return false;
    } finally { busyRef.current = false; setBusy(false); }
  };

  const save = async () => {
    if (issues.length || !libraryResourceId) { setError(issues[0]?.message ?? 'Choose the library module this adventure belongs to.'); return false; }
    if (record && !dirty) return true;
    return mutate(async () => {
      if (record) return adventureApi.save(record, content);
      const created = await adventureApi.create(libraryResourceId, content);
      try { sessionStorage.removeItem(storageKey); } catch { /* A confirmed create still succeeds without session storage. */ }
      accept(created);
      router.replace(`/adventures/${created.id}`);
      return created;
    }, 'Draft saved. Owner content changes only when you publish.');
  };

  const restore = () => {
    if (!recovery) return;
    setContent(recovery.content); setLibraryResourceId(record?.libraryResourceId ?? recovery.libraryResourceId);
    if (recovery.uncertain || (record && recovery.revision !== record.revision)) {
      setBlocked(true); setError('The recovered draft needs a server check before writing. Your local edits are preserved.');
    }
    setRecovery(null); setNotice('Recovered this tab’s unsaved draft. Review it before saving.');
  };
  const discardRecovery = () => {
    if (recovery?.uncertain && !record) { setError('Creation may have succeeded. Check the module list for this library resource before creating again.'); return; }
    setRecovery(null); try { sessionStorage.removeItem(storageKey); } catch { setStorageError(true); }
  };
  const reload = async () => {
    if (!record || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try { setLatest(await adventureApi.read(record.id)); }
    catch (failure) { setError(errorMessage(failure)); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const useLatest = () => {
    if (!latest) return;
    accept(latest); setLatest(null); setBlocked(false); setError(''); setNotice('Loaded the server draft.');
  };
  const resumeUnchanged = () => {
    if (!latest || !record || latest.revision !== record.revision) return;
    setRecord(latest); setLatest(null); setBlocked(false); setError('');
    setNotice('The server revision is unchanged. Your local edits are retained and can be saved.');
  };
  const leave = async (saveFirst: boolean) => {
    if (!destination || busyRef.current) return;
    if (saveFirst && !(await save())) return;
    const target = new URL(destination);
    setDestination(null);
    if (target.origin === window.location.origin) router.push(target.pathname + target.search + target.hash);
    else window.location.assign(target.href);
  };
  return { record, content, setContent, libraryResourceId, setLibraryResourceId, busy, blocked, error, setError, notice, dirty, issues, recovery, ready, storageError, destination, setDestination, latest, setLatest, save, mutate, restore, discardRecovery, reload, useLatest, resumeUnchanged, leave };
}
