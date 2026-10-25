import type { ApiListResponse, ApiResponse, ListQueryParams } from '@tapestry/api-client';
import type { LibraryResource, LibraryResourceSummary } from '@tapestry/types';
import { api } from './api';

// Admin reads include drafts; shared library helpers intentionally use public URLs.
export async function getAdminLibraryResources(params?: ListQueryParams): Promise<ApiListResponse<LibraryResourceSummary>> {
  return (await api.get('/library/resources/admin', { params })).data;
}

export async function getAdminLibraryResource(id: string): Promise<ApiResponse<LibraryResource>> {
  return (await api.get(`/library/resources/admin/${encodeURIComponent(id)}`)).data;
}
