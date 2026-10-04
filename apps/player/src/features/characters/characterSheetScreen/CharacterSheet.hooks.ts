'use client';

import { useCallback, useState } from 'react';
import type { NoteCard } from '@tapestry/types';
import { useCharacterSheetQuery } from './characterSheet.queries';
import { useUpdateCharacterSheetMutation } from './characterSheet.mutations';
import type { CharacterSheetScreenProps, PlayerCharacterSheet, TabKey } from './CharacterSheet.types';

export function useCharacterSheet({ characterId, mode }: CharacterSheetScreenProps) {
  const query = useCharacterSheetQuery<PlayerCharacterSheet>(characterId);
  const update = useUpdateCharacterSheetMutation<PlayerCharacterSheet>(characterId);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [currentMode, setCurrentMode] = useState(mode);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const saveNotes = useCallback((noteCards: NoteCard[]) => {
    update.mutate({ 'sheet.noteCards': noteCards });
  }, [update.mutate]);

  function saveDetails(payload: Record<string, unknown>) {
    update.mutate(payload, { onSuccess: () => setDetailsOpen(false) });
  }

  return { query, update, activeTab, setActiveTab, currentMode, setCurrentMode, detailsOpen, setDetailsOpen, saveNotes, saveDetails };
}
