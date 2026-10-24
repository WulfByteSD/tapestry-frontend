'use client';

import { useSettings } from '@tapestry/hooks';

import { api, tokenStore } from '@/lib/api';

import { fallbackOfficialSettings } from './settings.data';

export function usePortalSettings() {
  const query = useSettings(api, {
    // The settings API is authenticated; anonymous visitors use curated public copy.
    enabled: Boolean(tokenStore.get()),
    filterOptions: 'status;published',
    sortOptions: 'name',
    pageLimit: 12,
    retry: 0,
  });

  const fetchedSettings = query.data?.payload ?? [];
  const settings = fetchedSettings.length ? fetchedSettings : fallbackOfficialSettings;

  return {
    ...query,
    settings,
    isFallback: fetchedSettings.length === 0,
  };
}
