import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { makeDetailsDraft } from './CharacterDetails.helpers';
import type { CharacterDetailsDraft, CharacterDetailsProps } from './CharacterDetails.types';

export function useCharacterDetailsDraft({ open, sheet }: Pick<CharacterDetailsProps, 'open' | 'sheet'>) {
  const [draft, setDraft] = useState<CharacterDetailsDraft>(() => makeDetailsDraft(sheet));
  const settingsQuery = useQuery({
    queryKey: ['content:settings'],
    queryFn: () =>
      getSettings(api, {
        pageLimit: 50,
        sortOptions: 'name',
      }),
  });

  const settings = settingsQuery.data?.payload ?? [];
  useEffect(() => {
    if (open) {
      setDraft(makeDetailsDraft(sheet));
    }
  }, [open, sheet]);

  function setField<K extends keyof CharacterDetailsDraft>(key: K, value: CharacterDetailsDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return { draft, setField, settings, settingsLoading: settingsQuery.isLoading, settingsError: settingsQuery.isError, onRetrySettings: () => { void settingsQuery.refetch(); } };
}
