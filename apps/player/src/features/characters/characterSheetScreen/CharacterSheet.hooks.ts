'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@tapestry/socket';
import type { NoteCard } from '@tapestry/types';
import { useCharacterSheetQuery } from './characterSheet.queries';
import { useUpdateCharacterSheetMutation } from './characterSheet.mutations';
import type { CharacterSheetScreenProps, PlayerCharacterSheet, TabKey } from './CharacterSheet.types';

type NotesSaveJob = {
  cards: NoteCard[];
  listeners: { resolve: () => void; reject: (error: unknown) => void }[];
};

export function useCharacterSheet({ characterId, mode }: CharacterSheetScreenProps) {
  const query = useCharacterSheetQuery<PlayerCharacterSheet>(characterId);
  const update = useUpdateCharacterSheetMutation<PlayerCharacterSheet>(characterId);
  const qc = useQueryClient();
  const { socket } = useSocket();
  const campaignId = query.data?.payload.campaign;
  useEffect(() => {
    if (!socket || !campaignId) return;
    const refresh = () => { void qc.invalidateQueries({ queryKey: ['character', characterId] }); void qc.invalidateQueries({ queryKey: ['character-health-audit', characterId] }); };
    const changed = (event: { campaignId: string }) => { if (event.campaignId === campaignId) refresh(); };
    const access = (event: { campaignId: string }) => { if (event.campaignId === campaignId) { void qc.resetQueries({ queryKey: ['character-health-audit', characterId] }); refresh(); } };
    socket.on('connect', refresh);
    socket.on('encounter:sceneUpdated', changed);
    socket.on('chat:access:changed', access);
    return () => { socket.off('connect', refresh); socket.off('encounter:sceneUpdated', changed); socket.off('chat:access:changed', access); };
  }, [socket, campaignId, characterId, qc]);
  const { mutateAsync } = update;
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [currentMode, setCurrentMode] = useState(mode);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState<NoteCard[] | null>(null);
  const queuedNotes = useRef<NotesSaveJob | null>(null);
  const savingNotes = useRef(false);

  const saveNotes = useCallback((noteCards: NoteCard[]) => {
    setNotesDraft(noteCards);
    return new Promise<void>((resolve, reject) => {
      if (queuedNotes.current) {
        queuedNotes.current.cards = noteCards;
        queuedNotes.current.listeners.push({ resolve, reject });
      } else {
        queuedNotes.current = { cards: noteCards, listeners: [{ resolve, reject }] };
      }

      async function drainQueue() {
        if (savingNotes.current) return;
        savingNotes.current = true;
        try {
          while (queuedNotes.current) {
            const job = queuedNotes.current;
            queuedNotes.current = null;
            try {
              await mutateAsync({ 'sheet.noteCards': job.cards });
              job.listeners.forEach((listener) => listener.resolve());
              if (!queuedNotes.current) setNotesDraft(null);
            } catch (error) {
              // Keep the draft after failure; the screen already reports the
              // mutation error, and the next edit can retry without a stuck queue.
              job.listeners.forEach((listener) => listener.reject(error));
            }
          }
        } finally {
          savingNotes.current = false;
        }
      }

      void drainQueue();
    });
  }, [mutateAsync]);

  function saveDetails(payload: Record<string, unknown>) {
    update.mutate(payload, { onSuccess: () => setDetailsOpen(false) });
  }

  // Keep the latest submitted notes visible across tab unmounts while older
  // requests update the query cache. Other character fields still use the cache.
  const data = query.data;
  const visibleData = notesDraft && data?.payload ? {
    ...data,
    payload: { ...data.payload, sheet: { ...data.payload.sheet, noteCards: notesDraft } },
  } : data;

  return { query: { ...query, data: visibleData }, update, activeTab, setActiveTab, currentMode, setCurrentMode, detailsOpen, setDetailsOpen, saveNotes, saveDetails };
}
