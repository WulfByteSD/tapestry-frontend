'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLibraryResource,
  deleteLibraryResource,
  getLibraryResource,
  getLibraryResources,
  updateLibraryResource,
  uploadLibraryResourceFile,
} from '@tapestry/api-client';
import type { CreateLibraryResourceInput } from '@tapestry/types';
import type { ListQueryParams } from '@tapestry/api-client';
import { api } from '@/lib/api';

function normalizeListParams(params?: ListQueryParams) {
  return {
    keyword: params?.keyword ?? '',
    filterOptions: params?.filterOptions ?? '',
    includeOptions: params?.includeOptions ?? '',
    sortOptions: params?.sortOptions ?? '',
    pageNumber: params?.pageNumber ?? 1,
    pageLimit: params?.pageLimit ?? 10,
  };
}

export const storeResourceQueryKeys = {
  all: ['store', 'resources'] as const,
  resources: ['store', 'resources', 'list'] as const,
  resourceList: (params?: ListQueryParams) => [...storeResourceQueryKeys.resources, normalizeListParams(params)] as const,
  resource: (id: string) => ['store', 'resource', id] as const,
};

export function useStoreResources(params?: ListQueryParams) {
  return useQuery({
    queryKey: storeResourceQueryKeys.resourceList(params),
    queryFn: () => getLibraryResources(api, params),
  });
}

export function useStoreResource(id?: string) {
  return useQuery({
    queryKey: storeResourceQueryKeys.resource(id || 'missing'),
    queryFn: () => getLibraryResource(api, id as string),
    enabled: Boolean(id),
  });
}

export function useCreateStoreResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLibraryResourceInput) => createLibraryResource(api, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: storeResourceQueryKeys.all,
      });
    },
  });
}

export function useUpdateStoreResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateLibraryResourceInput> }) => updateLibraryResource(api, id, payload),
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: storeResourceQueryKeys.all,
      });

      queryClient.setQueryData(storeResourceQueryKeys.resource(variables.id), result);
    },
  });
}

export function useDeleteStoreResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLibraryResource(api, id),
    onSuccess: async (_result, id) => {
      await queryClient.invalidateQueries({
        queryKey: storeResourceQueryKeys.all,
      });

      queryClient.removeQueries({
        queryKey: storeResourceQueryKeys.resource(id),
      });
    },
  });
}

export function useUploadStoreResourceFile() {
  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) => uploadLibraryResourceFile(api, file, type, file.name),
  });
}
