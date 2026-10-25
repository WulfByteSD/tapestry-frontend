'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { unwovenApi } from './unwoven.api';
import { emptyDraft, errorMessage, fingerprint, payload, toDraft, uncertainWrite, validate } from './unwoven.helpers';
import type { Combatant, CombatantDraft, Recovery } from './unwoven.types';

export function useUnwovenDraft(initial: Combatant | undefined, userId: string) {
  const router = useRouter(), cache = useQueryClient();
  const [record, setRecord] = useState(initial);
  const [draft, setDraft] = useState<CombatantDraft>(() => initial ? toDraft(initial) : emptyDraft());
  const [busy, setBusy] = useState(false), busyRef = useRef(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [attempted, setAttempted] = useState(false), [blocked, setBlocked] = useState(false);
  const [ready, setReady] = useState(false), [storageError, setStorageError] = useState(false);
  const [recovery, setRecovery] = useState<Recovery | null>(null), [destination, setDestination] = useState<string | null>(null);
  const [latest, setLatest] = useState<Combatant | null>(null);
  const leaving = useRef(false);
  const storageKey = `tapestry-unwoven:${userId}:${initial?._id ?? 'new'}`;
  const dirty = fingerprint(draft) !== fingerprint(record ? toDraft(record) : emptyDraft());
  const issues = validate(draft);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) { const saved: Recovery = JSON.parse(raw); validate(saved.draft); setRecovery(saved); }
    } catch { setStorageError(true); }
    setReady(true);
  }, [storageKey]);
  useEffect(() => {
    if (!ready || recovery || leaving.current) return;
    try { if (dirty || blocked) sessionStorage.setItem(storageKey, JSON.stringify({ draft, uncertain: blocked })); else sessionStorage.removeItem(storageKey); }
    catch { setStorageError(true); }
  }, [blocked, dirty, draft, ready, recovery, storageKey]);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => { if (!leaving.current && (dirty || busyRef.current || blocked || recovery)) { e.preventDefault(); e.returnValue = ''; } };
    const click = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download') || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0 || link.getAttribute('href')?.startsWith('#')) return;
      if (!leaving.current && (dirty || busyRef.current || blocked || recovery) && link.href !== location.href) { e.preventDefault(); e.stopPropagation(); setDestination(link.href); }
    };
    window.addEventListener('beforeunload', unload); document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', click, true); };
  }, [blocked, dirty, recovery]);
  const invalidate = () => { void cache.invalidateQueries({ queryKey: ['unwoven', 'list'] }); void cache.invalidateQueries({ queryKey: ['adventures', 'combatants'] }); void cache.invalidateQueries({ queryKey: ['adventures', 'combatant'] }); };
  const accept = (next: Combatant) => { setRecord(next); setDraft(toDraft(next)); setLatest(null); setBlocked(false); setRecovery(null); cache.setQueryData(['unwoven', 'detail', next._id, userId], next); invalidate(); };
  const run = async (operation: () => Promise<void>) => {
    if (busyRef.current || blocked || recovery || !ready) return false;
    busyRef.current = true; setBusy(true); setError(''); setNotice('');
    try { await operation(); return true; }
    catch (failure) { setError(errorMessage(failure)); if (uncertainWrite(failure)) setBlocked(true); return false; }
    finally { busyRef.current = false; setBusy(false); }
  };
  const clearRecovery = () => { try { sessionStorage.removeItem(storageKey); } catch { setStorageError(true); } };
  const save = async () => {
    setAttempted(true);
    if (issues.length) { setError('Check the highlighted fields before saving.'); return false; }
    return run(async () => {
      if (record) { const saved = await unwovenApi.save(record._id, draft); if (!saved) throw new Error('No saved record'); accept(saved); setNotice('Unwoven saved.'); }
      else { const id = await unwovenApi.create(draft); if (!id) throw new Error('Missing created ID'); accept({ ...payload(draft), _id: id } as Combatant); clearRecovery(); leaving.current = true; router.replace(`/unwoven/${id}`); }
    });
  };
  const remove = () => run(async () => { if (!record) return; await unwovenApi.remove(record._id); leaving.current = true; clearRecovery(); await cache.cancelQueries({ queryKey: ['unwoven', 'detail', record._id] }); cache.removeQueries({ queryKey: ['unwoven', 'detail', record._id] }); invalidate(); router.replace('/unwoven'); });
  const checkServer = async () => {
    if (!record || busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try { setLatest(await unwovenApi.read(record._id)); } catch (failure) { setError(errorMessage(failure)); }
    finally { busyRef.current = false; setBusy(false); }
  };
  const leave = () => { if (busyRef.current || !destination) return; leaving.current = true; clearRecovery(); router.push(destination); };
  const restore = () => { if (recovery) { setDraft(recovery.draft); setBlocked(!!recovery.uncertain); setRecovery(null); } };
  const download = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(payload(draft), null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'unwoven-draft.json'; a.click(); URL.revokeObjectURL(url); };
  return { record, draft, setDraft, busy, error, notice, dirty, issues, attempted, blocked, ready, recovery, storageError, destination, setDestination, latest,
    save, remove, checkServer, leave, restore, download, useLatest: () => latest && accept(latest),
    discardRecovery: () => { clearRecovery(); setRecovery(null); },
    resume: () => { if (latest && record && fingerprint(toDraft(latest)) === fingerprint(toDraft(record))) { setBlocked(false); setLatest(null); } },
    canResume: !!latest && !!record && fingerprint(toDraft(latest)) === fingerprint(toDraft(record)),
  };
}
