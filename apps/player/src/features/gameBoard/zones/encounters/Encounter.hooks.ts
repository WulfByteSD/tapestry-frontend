'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addEncounterParticipant, createEncounterDraft, duplicateEncounterParticipant, getEncounterDraft, getEncounterDrafts, removeEncounterParticipant, updateEncounterDraft, updateEncounterParticipant, updateEncounterTurnOrder } from '@tapestry/api-client';
import type { EncounterCombatantSnapshot, EncounterDraft, EncounterTurnOrderAction } from '@tapestry/types';
import { api } from '@/lib/api';
import { encounterError, isConflict } from './Encounter.helpers';
import type { SourceKind } from './Encounter.types';

export function useEncounterPreparation(campaignId: string, viewerId: string, active: boolean, readOnly: boolean) {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<EncounterDraft | null>(null);
  const currentDraft = useRef<EncounterDraft | null>(null);
  const pending = useRef(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [notice, setNotice] = useState('');
  const dirty = editing && (draft ? title !== draft.title || notes !== draft.notes : Boolean(title || notes));
  const list = useQuery({ queryKey: ['encounter-drafts', campaignId, viewerId, page], queryFn: () => getEncounterDrafts(api, campaignId, { pageNumber: page, pageLimit: 20 }), enabled: active });
  useQuery({ queryKey: ['encounter-live-draft', campaignId, viewerId, draft?.id ?? ''], queryFn: () => getEncounterDraft(api, campaignId, draft!.id), enabled: !!draft, staleTime: Infinity, retry: false });
  useEffect(() => client.getQueryCache().subscribe(event => {
    const key = event.query.queryKey;
    if (event.type !== 'updated' || event.action.type !== 'success' || key[0] !== 'encounter-live-draft' || key[1] !== campaignId || key[2] !== viewerId) return;
    const next = (event.query.state.data as { payload: EncounterDraft } | undefined)?.payload;
    const previous = currentDraft.current;
    if (!next || !previous || next.id !== previous.id || next.revision <= previous.revision) return;
    currentDraft.current = next;
    setDraft(next);
    setTitle(value => value === previous.title ? next.title : value);
    setNotes(value => value === previous.notes ? next.notes : value);
    setConflict(false);
  }), [client, campaignId, viewerId]);
  useEncounterLeaveGuard(dirty);
  const canLeave = () => !dirty || window.confirm('Discard the unsaved encounter title and notes?');
  const select = async (id: string) => {
    if (pending.current || !canLeave()) return false;
    pending.current = true;
    setBusy(true); setError(''); setNotice('');
    try { const next = (await getEncounterDraft(api, campaignId, id)).payload; currentDraft.current = next; setDraft(next); setTitle(next.title); setNotes(next.notes); setEditing(true); setConflict(false); return true; }
    catch (reason) { setError(encounterError(reason)); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  const create = () => {
    if (pending.current || readOnly || !canLeave()) return;
    currentDraft.current = null;
    setDraft(null); setTitle(''); setNotes(''); setEditing(true); setError(''); setConflict(false); setNotice('');
  };
  const mutate = async (operation: () => Promise<{ payload: EncounterDraft }>, saveDetails = false, successNotice = 'Roster saved.') => {
    if (pending.current || readOnly || conflict) return false;
    pending.current = true;
    setBusy(true); setError(''); setNotice('');
    try {
      const next = (await operation()).payload;
      currentDraft.current = next;
      setDraft(next);
      if (saveDetails) { setTitle(next.title); setNotes(next.notes); }
      setNotice(saveDetails ? 'Draft saved.' : successNotice);
      await client.invalidateQueries({ queryKey: ['encounter-drafts', campaignId] });
      return true;
    } catch (reason) { setError(encounterError(reason)); setConflict(isConflict(reason)); return false; }
    finally { pending.current = false; setBusy(false); }
  };
  const save = () => {
    if (!title.trim()) { setError('Give this encounter a title.'); return Promise.resolve(false); }
    return mutate(() => draft ? updateEncounterDraft(api, campaignId, draft.id, { title: title.trim(), notes, revision: draft.revision }) : createEncounterDraft(api, campaignId, { title: title.trim(), notes }), true);
  };
  const add = (kind: Exclude<SourceKind, 'custom'>, id: string) => {
    const latest = currentDraft.current;
    return latest ? mutate(() => addEncounterParticipant(api, campaignId, latest.id, { revision: latest.revision, source: { kind, id } })) : Promise.resolve(false);
  };
  const update = (id: string, snapshot: EncounterCombatantSnapshot) => draft ? mutate(() => updateEncounterParticipant(api, campaignId, draft.id, id, { revision: draft.revision, snapshot })) : Promise.resolve(false);
  const duplicate = (id: string) => draft && mutate(() => duplicateEncounterParticipant(api, campaignId, draft.id, id, draft.revision));
  const remove = (id: string) => draft && mutate(() => removeEncounterParticipant(api, campaignId, draft.id, id, draft.revision));
  const turn = (action: EncounterTurnOrderAction) => {
    const latest = currentDraft.current;
    return latest ? mutate(() => updateEncounterTurnOrder(api, campaignId, latest.id, { revision: latest.revision, ...action }), false, 'Turn order saved.') : Promise.resolve(false);
  };
  return { list, page, setPage, draft, editing, title, setTitle, notes, setNotes, busy, error, conflict, notice, dirty, select, create, save, add, update, duplicate, remove, turn };
}

export function useEncounterLeaveGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const followLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') as HTMLAnchorElement | null : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm('Leave this campaign and discard unsaved encounter changes?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', followLink, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', followLink, true); };
  }, [dirty]);
}
