'use client';

import { useSettings } from '@tapestry/hooks';

import { api } from '@/lib/api';

import { fallbackOfficialSettings } from './settings.data';

export function usePortalSettings() {
  const query = useSettings(api, {
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
