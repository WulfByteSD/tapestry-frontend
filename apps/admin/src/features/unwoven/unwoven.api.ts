import { api } from '@/lib/api';
import type { ApiListResponse } from '@tapestry/api-client';
import type { Combatant, CombatantDraft } from './unwoven.types';
import { payload } from './unwoven.helpers';
const root = '/game/content/combatants';
const path = (id: string) => `${root}/${encodeURIComponent(id)}`;
export const unwovenApi = {
  list: async (keyword: string, page: number, status: string, category: string): Promise<ApiListResponse<Combatant>> => (await api.get(root, { params: {
    keyword: keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), pageNumber: page, pageLimit: 20, sortOptions: 'name',
    filterOptions: [status && `status;${status}`, category && `category;${category}`].filter(Boolean).join('|'),
  } })).data,
  read: async (id: string): Promise<Combatant> => (await api.get(path(id))).data.payload,
  create: async (draft: CombatantDraft): Promise<string> => (await api.post(root, payload(draft))).data.payload,
  save: async (id: string, draft: CombatantDraft): Promise<Combatant> => (await api.put(path(id), payload(draft))).data.payload,
  remove: async (id: string): Promise<void> => { await api.delete(path(id)); },
};
