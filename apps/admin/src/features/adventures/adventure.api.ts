import { api } from '@/lib/api';
import type { ApiListResponse } from '@tapestry/api-client';
import { getAdminLibraryResource, getAdminLibraryResources } from '@/lib/adminLibrary';
import type { Adventure, AdventureContent, AdventureSummary, Combatant } from './adventure.types';
import { writeContent } from './adventure.helpers';

const root = '/game/adventures/admin';
const path = (id: string) => `${root}/${encodeURIComponent(id)}`;
const assetPath = (id: string, resourceId: string) => `${path(id)}/resources/${encodeURIComponent(resourceId)}/asset`;
export const adventureApi = {
  list: async (page: number): Promise<AdventureSummary[]> => (await api.get(root, { params: { page } })).data.payload,
  read: async (id: string): Promise<Adventure> => {
    const record: Adventure = (await api.get(path(id))).data.payload;
    return { ...record, sections: [...record.sections].sort((a, b) => a.sortOrder - b.sortOrder) };
  },
  create: async (libraryResourceId: string, content: AdventureContent): Promise<Adventure> =>
    (await api.post(root, { libraryResourceId, content: writeContent(content) })).data.payload,
  save: async (record: Adventure, content: AdventureContent): Promise<Adventure> =>
    (await api.put(path(record.id), { revision: record.revision, content: writeContent(content) })).data.payload,
  status: async (record: Adventure, status: 'published' | 'archived'): Promise<Adventure> =>
    (await api.patch(`${path(record.id)}/status`, { revision: record.revision, status })).data.payload,
  remove: async (record: Adventure): Promise<void> => { await api.delete(path(record.id), { data: { revision: record.revision } }); },
  upload: async (record: Adventure, resourceId: string, file: File): Promise<Adventure> =>
    (await api.post(assetPath(record.id, resourceId), file, { params: { revision: record.revision }, headers: { 'Content-Type': 'application/octet-stream' } })).data.payload,
  removeAsset: async (record: Adventure, resourceId: string): Promise<Adventure> =>
    (await api.delete(assetPath(record.id, resourceId), { data: { revision: record.revision } })).data.payload,
  download: async (id: string, resourceId: string): Promise<Blob> =>
    (await api.get(assetPath(id, resourceId), { responseType: 'blob' })).data,
  libraries: (pageNumber: number) => getAdminLibraryResources({ pageNumber, pageLimit: 25, filterOptions: 'kind;module|accessPolicy;entitlement', sortOptions: 'title' }),
  library: (id: string) => getAdminLibraryResource(id),
  combatants: async (keyword: string, pageNumber: number): Promise<ApiListResponse<Combatant>> =>
    (await api.get('/game/content/combatants', { params: { keyword: keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), pageNumber, pageLimit: 20, sortOptions: 'name', filterOptions: 'status;{"$ne":"archived"}' } })).data,
  combatant: async (id: string): Promise<Combatant | null> => {
    try { const record: Combatant = (await api.get(`/game/content/combatants/${encodeURIComponent(id)}`)).data.payload; return record.status === 'archived' ? null : record; }
    catch (error) { if ((error as { response?: { status?: number } }).response?.status === 404) return null; throw error; }
  },
};
