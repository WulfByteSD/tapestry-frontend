'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createEncounterLibraryEntry, getEncounterCatalog, getEncounterCharacters, getEncounterLibrary } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { combatantIssue, emptyCombatant, encounterError, snapshotFromForm } from './Encounter.helpers';
import type { AddParticipantProps, EncounterSourcePage, SourceKind } from './Encounter.types';

export function useEncounterSources({ active, campaignId, viewerId, onAdd }: Pick<AddParticipantProps, 'active' | 'campaignId' | 'viewerId' | 'onAdd'>) {
  const [source, setSource] = useState<SourceKind>('character');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [value, setValue] = useState(emptyCombatant);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [customAdded, setCustomAdded] = useState(false);
  const pending = useRef(false);
  const addedCounts = useRef<Record<string, number>>({});
  const client = useQueryClient();
  useEffect(() => { const timeout = setTimeout(() => { setSearch(keyword); setPage(1); }, 300); return () => clearTimeout(timeout); }, [keyword]);
  const options = useQuery({
    queryKey: ['encounter-source', campaignId, viewerId, source, search, page],
    enabled: active && source !== 'custom',
    queryFn: async (): Promise<EncounterSourcePage> => {
      if (source === 'character') {
        const response = await getEncounterCharacters(api, campaignId);
        return { pages: 1, items: response.payload.filter(entry => entry.snapshot.name.toLowerCase().includes(search.toLowerCase())).map(entry => ({ id: entry.id, name: entry.snapshot.name, portrait: entry.snapshot.avatarUrl, summary: `${entry.snapshot.archetypeKey || 'Archetype not set'} · Weave ${entry.snapshot.weaveLevel}` })) };
      }
      const response = await (source === 'catalog' ? getEncounterCatalog : getEncounterLibrary)(api, { keyword: search, pageNumber: page, pageLimit: 20 });
      return { pages: response.metadata?.pages ?? 1, items: response.payload.map(entry => ({ id: entry.id, name: entry.snapshot.name, portrait: entry.snapshot.media?.portraitUrl, summary: `HP ${entry.snapshot.statline.hp}${entry.snapshot.tier ? ` · Tier ${entry.snapshot.tier}` : ''}`, snapshot: entry.snapshot })) };
    },
  });
  const changeSource = (next: SourceKind) => { setSource(next); setKeyword(''); setSearch(''); setPage(1); setError(''); setNotice(''); };
  const recordAdded = (kind: string, id: string, name: string) => {
    const key = `${kind}:${id}`;
    const count = (addedCounts.current[key] ?? 0) + 1;
    addedCounts.current[key] = count;
    setNotice(`Added ${name}${count > 1 ? ` (${count})` : ''}`);
  };
  const add = async (id: string) => {
    if (source === 'custom' || pending.current) return false;
    pending.current = true; setSaving(true); setError('');
    try {
      const success = await onAdd(source, id);
      if (success) recordAdded(source, id, options.data?.items.find(entry => entry.id === id)?.name ?? 'participant');
      return success;
    } catch (reason) { setError(encounterError(reason)); return false; }
    finally { pending.current = false; setSaving(false); }
  };
  const saveCustom = async () => {
    if (pending.current) return false;
    const issue = combatantIssue(value);
    if (issue) { setError(issue); return false; }
    pending.current = true; setSaving(true); setError('');
    try {
      // Keep the durable template ID when the second request fails. A retry only adds it.
      const id = savedId ?? (await createEncounterLibraryEntry(api, snapshotFromForm(value))).payload.id;
      setSavedId(id);
      if (!savedId) void client.invalidateQueries({ queryKey: ['encounter-source', campaignId, viewerId, 'personal'] });
      const added = await onAdd('personal', id);
      if (added) { setCustomAdded(true); recordAdded('personal', id, value.name); }
      else setError('Saved to My library. Adding failed; retry below.');
      return added;
    } catch (reason) { setError(encounterError(reason)); return false; }
    finally { pending.current = false; setSaving(false); }
  };
  const newCustom = () => { if (!pending.current) { setValue(emptyCombatant()); setSavedId(null); setCustomAdded(false); setError(''); setNotice(''); } };
  return { source, changeSource, keyword, setKeyword, search, page, setPage, options, value, setValue, savedId, saving, error, notice, customAdded, add, saveCustom, newCustom };
}

