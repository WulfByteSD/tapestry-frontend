import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@tapestry/socket';
import { getCampaignEncounterScenes, getEncounterScene, getSceneExchanges } from '@tapestry/api-client';
import type { EncounterOverlap, EncounterScene, EncounterSceneMutationResult, EncounterSceneSummary } from '@tapestry/types';
import { api } from '@/lib/api';
import { useEncounterLeaveGuard } from '../zones/encounters/Encounter.hooks';
import { rollHistoryKey } from '../rollHistory/RollHistory.helpers';
import { chatError, isAccessError } from '../chat/Chat.helpers';

export const sceneKeys = { base: (campaign: string, viewer: string) => ['encounter-scenes', campaign, viewer] as const };

export function useEncounterScenes(campaignId: string, viewerId: string) {
  const qc = useQueryClient();
  const { socket } = useSocket();
  const [selected, setSelected] = useState<EncounterSceneSummary | null>(null);
  const [actingSelection, setActingSelection] = useState<{ sceneId: string; participantId: string } | null>(null);
  const [retainedScene, setRetainedScene] = useState<EncounterScene | null>(null);
  const [invitation, setInvitation] = useState<EncounterSceneSummary | null>(null);
  const [refreshingAccess, setRefreshingAccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const running = useRef(false);
  const [overlaps, setOverlaps] = useState<EncounterOverlap[]>([]);
  const pendingOverlap = useRef<{ operation: () => Promise<boolean>; message: string } | null>(null);
  const list = useQuery({ queryKey: [...sceneKeys.base(campaignId, viewerId), 'list'], queryFn: () => getCampaignEncounterScenes(api, campaignId), enabled: !!viewerId, staleTime: 15000, retry: (count, failure) => !isAccessError(failure) && count < 1 });
  const selectedAllowed = !refreshingAccess && !list.isError && list.data?.payload.some(scene => scene.id === selected?.id);
  const detail = useQuery({ queryKey: [...sceneKeys.base(campaignId, viewerId), 'detail', selected?.id ?? ''], queryFn: () => getEncounterScene(api, campaignId, selected!.encounterId, selected!.id), enabled: !!selectedAllowed, retry: false });
  const scene = selectedAllowed && !detail.isError ? detail.data?.payload ?? null : null;
  const actingParticipantId = actingSelection && actingSelection.sceneId === scene?.id && scene?.participants.some(entry => entry.id === actingSelection.participantId && (entry.kind === 'combatant' ? scene.canManage && entry.revealed : entry.ownerPlayerId === viewerId && scene.playableCharacterIds.includes(entry.characterId ?? ''))) ? actingSelection.participantId : null;
  useEffect(() => {
    if (refreshingAccess || detail.isLoading || detail.isError || list.isError) return;
    if (actingSelection && (actingSelection.sceneId !== selected?.id || (scene && !actingParticipantId))) setActingSelection(null);
  }, [actingSelection, actingParticipantId, selected?.id, scene, refreshingAccess, detail.isLoading, detail.isError, list.isError]);
  const selectActor = (participantId: string | null) => setActingSelection(participantId && scene ? { sceneId: scene.id, participantId } : null);
  const exchanges = useQuery({ queryKey: [...sceneKeys.base(campaignId, viewerId), 'exchanges', selected?.id ?? ''], queryFn: () => getSceneExchanges(api, campaignId, selected!.encounterId, selected!.id), enabled: !!scene, retry: false });
  const refresh = useCallback(async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: sceneKeys.base(campaignId, viewerId) }),
      qc.invalidateQueries({ queryKey: ['chat', campaignId, viewerId] }),
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'characters'] }),
      qc.invalidateQueries({ queryKey: ['character'] }),
      qc.invalidateQueries({ queryKey: ['character-health-audit'] }),
      qc.invalidateQueries({ queryKey: ['encounter-drafts', campaignId] }),
      qc.invalidateQueries({ queryKey: ['encounter-live-draft', campaignId, viewerId] }),
      qc.invalidateQueries({ queryKey: rollHistoryKey(campaignId, viewerId) }),
    ]);
  }, [campaignId, viewerId, qc]);

  useEffect(() => qc.getQueryCache().subscribe(event => {
    const key = event.query.queryKey;
    if (event.type !== 'updated' || key[0] !== 'encounter-scenes' || key[1] !== campaignId || key[2] !== viewerId) return;
    if (event.action.type === 'error' && isAccessError(event.action.error)) {
      setRetainedScene(null); setSelected(null); setActingSelection(null); setInvitation(null); setOverlaps([]); pendingOverlap.current = null;
      if (key[3] === 'detail') void qc.invalidateQueries({ queryKey: [...sceneKeys.base(campaignId, viewerId), 'list'] });
    }
    if (key[3] !== 'detail') return;
    if (event.action.type === 'success') setRetainedScene((event.query.state.data as { payload: EncounterScene }).payload);
    if (event.action.type === 'error' && isAccessError(event.action.error)) setRetainedScene(null);
  }), [qc, campaignId, viewerId]);

  useEffect(() => {
    if (!list.data || list.isError) return;
    const allowed = list.data.payload.map(entry => entry.id);
    for (const query of qc.getQueryCache().findAll({ queryKey: sceneKeys.base(campaignId, viewerId) })) {
      if (query.queryKey[3] !== 'list' && !allowed.includes(String(query.queryKey[4]))) {
        void qc.cancelQueries({ queryKey: query.queryKey });
        qc.removeQueries({ queryKey: query.queryKey });
      }
    }
    setRetainedScene(value => value && allowed.includes(value.id) ? value : null);
    setSelected(value => value && allowed.includes(value.id) ? value : null);
    setInvitation(value => value && allowed.includes(value.id) ? value : null);
    setRefreshingAccess(false);
  }, [list.data, list.dataUpdatedAt, list.isError, campaignId, viewerId, qc]);

  useEffect(() => {
    if (!socket) return;
    const changed = (event: { campaignId: string }) => { if (event.campaignId === campaignId) void refresh(); };
    const access = () => {
      setRefreshingAccess(true);
      setError('');
      void qc.cancelQueries({ queryKey: rollHistoryKey(campaignId, viewerId) });
      void qc.resetQueries({ queryKey: rollHistoryKey(campaignId, viewerId) });
      void qc.cancelQueries({ queryKey: ['character-health-audit'] });
      void qc.resetQueries({ queryKey: ['character-health-audit'] });
      for (const kind of ['detail', 'exchanges']) {
        void qc.cancelQueries({ queryKey: [...sceneKeys.base(campaignId, viewerId), kind] });
        qc.removeQueries({ queryKey: [...sceneKeys.base(campaignId, viewerId), kind] });
      }
      void refresh();
    };
    const accessChanged = (event: { campaignId: string }) => { if (event.campaignId === campaignId) access(); };
    const opened = async (event: { campaignId: string; sceneId?: string; scene?: EncounterSceneSummary }) => {
      if (event.campaignId !== campaignId) return;
      await refresh();
      const response = await getCampaignEncounterScenes(api, campaignId).catch(() => null);
      const match = response?.payload.find(entry => entry.id === (event.sceneId ?? event.scene?.id));
      if (match?.status === 'open') setInvitation(match);
    };
    socket.on('connect', access);
    socket.on('chat:access:changed', accessChanged);
    socket.on('encounter:sceneUpdated', changed);
    socket.on('encounter:exchangeUpdated', changed);
    socket.on('encounter:sceneOpened', opened);
    return () => {
      socket.off('connect', access); socket.off('chat:access:changed', accessChanged);
      socket.off('encounter:sceneUpdated', changed); socket.off('encounter:exchangeUpdated', changed); socket.off('encounter:sceneOpened', opened);
    };
  }, [socket, campaignId, viewerId, qc, refresh]);

  const run = async <T,>(operation: () => Promise<T>, message = ''): Promise<T | null> => {
    if (running.current) return null;
    running.current = true; setBusy(true); setError(''); setNotice('');
    try { const result = await operation(); await refresh(); setNotice(result === false ? '' : message); return result; }
    catch (failure) { setError(chatError(failure)); if (isAccessError(failure)) { setSelected(null); void refresh(); } return null; }
    finally { running.current = false; setBusy(false); }
  };
  const cancelOverlap = () => { pendingOverlap.current = null; setOverlaps([]); };
  const mutateScene = async (operation: (confirmed: boolean) => Promise<{ payload: EncounterSceneMutationResult }>, message: string, onSuccess?: () => void) => run(async () => {
    const response = await operation(false);
    if (response.payload.requiresConfirmation) {
      setOverlaps(response.payload.overlaps);
      pendingOverlap.current = { message, operation: async () => {
        const confirmed = await operation(true);
        if (confirmed.payload.requiresConfirmation) throw new Error('The cast changed. Review the overlap and try again.');
        setSelected(confirmed.payload.scene); cancelOverlap(); onSuccess?.(); return true;
      } };
      return false;
    }
    setSelected(response.payload.scene); cancelOverlap(); onSuccess?.(); return true;
  }, message);
  const confirmOverlap = async () => {
    const pending = pendingOverlap.current;
    if (pending) return run(pending.operation, pending.message);
    return false;
  };
  return { campaignId, viewerId, list, detail, scene, retainedScene, exchanges, selected, select: setSelected, actingParticipantId, selectActor, invitation, dismissInvitation: () => setInvitation(null), refreshingAccess, busy, error, notice, run, mutateScene, refresh, overlaps, confirmOverlap, cancelOverlap };
}

export function useSceneSetupGuard(dirty: boolean) {
  useEncounterLeaveGuard(dirty);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('[data-encounter-discard]') : null;
      if (target && !window.confirm('Discard your unfinished scene changes?')) { event.preventDefault(); event.stopPropagation(); }
    };
    document.addEventListener('click', guard, true);
    return () => document.removeEventListener('click', guard, true);
  }, [dirty]);
}
