import { api } from '@/lib/api';
import type { ApiListResponse } from '@tapestry/api-client';
import type { SettingOption, LoreOption } from './unwoven.types';
export const lookupApi = {
  origins: async (): Promise<string[]> => (await api.get('/game/content/combatants/origins')).data.payload,
  settings: async (): Promise<SettingOption[]> => {
    const records: SettingOption[] = [];
    for (let pageNumber = 1; ; pageNumber++) {
      const data: ApiListResponse<SettingOption> = (await api.get('/game/content/settings', { params: { pageNumber, pageLimit: 100, sortOptions: 'name' } })).data;
      records.push(...data.payload);
      if (pageNumber >= (data.metadata?.pages ?? 1)) return records;
    }
  },
  lore: async (keyword: string, pageNumber: number): Promise<ApiListResponse<LoreOption>> => (await api.get('/game/content/lore', { params: { keyword: keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), pageNumber, pageLimit: 15, sortOptions: 'name', filterOptions: 'status;{"$ne":"archived"}' } })).data,
  loreNode: async (id: string): Promise<LoreOption | null> => {
    try { return (await api.get(`/game/content/lore/${encodeURIComponent(id)}`)).data.payload; }
    catch (error) { if ((error as { response?: { status?: number } }).response?.status === 404) return null; throw error; }
  },
};
