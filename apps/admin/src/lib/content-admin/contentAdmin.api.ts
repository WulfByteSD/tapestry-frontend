import { cleanParams } from '@tapestry/api-client';
import { api } from '@/lib/api';
import type {
  ContentAdminCreateResponse,
  ContentAdminDeleteResponse,
  ContentAdminDetailResponse,
  ContentAdminListParams,
  ContentAdminListResponse,
  ContentAdminPayload,
  ContentAdminRecord,
  ContentAdminResource,
  ContentImportMode,
  ContentImportResponse,
} from './contentAdmin.types';
import { CONTENT_ADMIN_RESOURCE_PATHS } from './contentAdmin.types';

function getBasePath(resource: ContentAdminResource) {
  return CONTENT_ADMIN_RESOURCE_PATHS[resource];
}

function buildImportFormData(file: File | Blob, filename?: string) {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append('file', file, filename ?? file.name);
    return formData;
  }

  formData.append('file', file, filename ?? 'import.csv');
  return formData;
}

export async function listContent<K extends ContentAdminResource>(resource: K, params?: ContentAdminListParams): Promise<ContentAdminListResponse<K>> {
  const res = await api.get(getBasePath(resource), {
    params: cleanParams(params || {}),
  });

  return res.data;
}

export async function getContent<K extends ContentAdminResource>(resource: K, id: string): Promise<ContentAdminDetailResponse<K>> {
  const res = await api.get(`${getBasePath(resource)}/${encodeURIComponent(id)}`);
  return res.data;
}

export async function createContent<K extends ContentAdminResource>(resource: K, payload: ContentAdminPayload<K>): Promise<ContentAdminCreateResponse> {
  const res = await api.post(getBasePath(resource), payload);
  return res.data;
}

export async function updateContent<K extends ContentAdminResource>(resource: K, id: string, payload: ContentAdminPayload<K>): Promise<ContentAdminDetailResponse<K>> {
  const res = await api.put(`${getBasePath(resource)}/${encodeURIComponent(id)}`, payload);
  return res.data;
}

export async function deleteContent<K extends ContentAdminResource>(resource: K, id: string): Promise<ContentAdminDeleteResponse> {
  const res = await api.delete(`${getBasePath(resource)}/${encodeURIComponent(id)}`);
  return res.data;
}

export async function importContentCsv<K extends ContentAdminResource>(
  resource: K,
  file: File | Blob,
  mode: ContentImportMode = 'dry-run',
  filename?: string
): Promise<ContentImportResponse> {
  const formData = buildImportFormData(file, filename);

  const res = await api.post(`${getBasePath(resource)}/import?mode=${mode}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

// Convenience resource-specific exports

export const listItems = (params?: ContentAdminListParams) => listContent('items', params);
export const getItem = (id: string) => getContent('items', id);
export const createItem = (payload: ContentAdminPayload<'items'>) => createContent('items', payload);
export const updateItem = (id: string, payload: ContentAdminPayload<'items'>) => updateContent('items', id, payload);
export const deleteItem = (id: string) => deleteContent('items', id);
export const importItemsCsv = (file: File | Blob, mode?: ContentImportMode, filename?: string) => importContentCsv('items', file, mode, filename);

export const listSkills = (params?: ContentAdminListParams) => listContent('skills', params);
export const getSkill = (id: string) => getContent('skills', id);
export const createSkill = (payload: ContentAdminPayload<'skills'>) => createContent('skills', payload);
export const updateSkill = (id: string, payload: ContentAdminPayload<'skills'>) => updateContent('skills', id, payload);
export const deleteSkill = (id: string) => deleteContent('skills', id);
export const importSkillsCsv = (file: File | Blob, mode?: ContentImportMode, filename?: string) => importContentCsv('skills', file, mode, filename);

export const listAbilities = (params?: ContentAdminListParams) => listContent('abilities', params);
export const getAbility = (id: string) => getContent('abilities', id);
export const createAbility = (payload: ContentAdminPayload<'abilities'>) => createContent('abilities', payload);
export const updateAbility = (id: string, payload: ContentAdminPayload<'abilities'>) => updateContent('abilities', id, payload);
export const deleteAbility = (id: string) => deleteContent('abilities', id);
export const importAbilitiesCsv = (file: File | Blob, mode?: ContentImportMode, filename?: string) => importContentCsv('abilities', file, mode, filename);
