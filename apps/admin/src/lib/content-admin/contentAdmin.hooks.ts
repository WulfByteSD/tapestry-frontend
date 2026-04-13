'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContent, deleteContent, getContent, getExportCount, importContentCsv, listContent, updateContent } from './contentAdmin.api';
import type {
  ContentAdminCreateResponse,
  ContentAdminDeleteResponse,
  ContentAdminDetailResponse,
  ContentAdminListParams,
  ContentAdminResource,
  ContentExportCountResponse,
  ContentImportResponse,
  CreateContentVariables,
  DeleteContentVariables,
  ImportContentVariables,
  UpdateContentVariables,
} from './contentAdmin.types';

function normalizeListParams(params?: ContentAdminListParams) {
  return {
    keyword: params?.keyword ?? '',
    filterOptions: params?.filterOptions ?? '',
    includeOptions: params?.includeOptions ?? '',
    sortOptions: params?.sortOptions ?? '',
    pageNumber: params?.pageNumber ?? 1,
    pageLimit: params?.pageLimit ?? 10,
  };
}

export const contentAdminQueryKeys = {
  all: ['content-admin'] as const,

  resource: (resource: ContentAdminResource) => [...contentAdminQueryKeys.all, resource] as const,

  lists: (resource: ContentAdminResource) => [...contentAdminQueryKeys.resource(resource), 'list'] as const,

  list: (resource: ContentAdminResource, params?: ContentAdminListParams) => [...contentAdminQueryKeys.lists(resource), normalizeListParams(params)] as const,

  details: (resource: ContentAdminResource) => [...contentAdminQueryKeys.resource(resource), 'detail'] as const,

  detail: (resource: ContentAdminResource, id: string) => [...contentAdminQueryKeys.details(resource), id] as const,
};

export function useContentList<K extends ContentAdminResource>(resource: K, params?: ContentAdminListParams) {
  return useQuery({
    queryKey: contentAdminQueryKeys.list(resource, params),
    queryFn: () => listContent(resource, params),
  });
}

export function useContentEntry<K extends ContentAdminResource>(resource: K, id?: string) {
  return useQuery({
    queryKey: contentAdminQueryKeys.detail(resource, id || 'missing'),
    queryFn: () => getContent(resource, id as string),
    enabled: Boolean(id),
  });
}

export function useCreateContentEntry() {
  const queryClient = useQueryClient();

  return useMutation<ContentAdminCreateResponse, Error, CreateContentVariables<ContentAdminResource>>({
    mutationFn: ({ resource, payload }) => createContent(resource, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: contentAdminQueryKeys.lists(variables.resource),
      });
    },
  });
}

export function useUpdateContentEntry() {
  const queryClient = useQueryClient();

  return useMutation<ContentAdminDetailResponse<ContentAdminResource>, Error, UpdateContentVariables<ContentAdminResource>>({
    mutationFn: ({ resource, id, payload }) => updateContent(resource, id, payload),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: contentAdminQueryKeys.lists(variables.resource),
      });

      queryClient.setQueryData(contentAdminQueryKeys.detail(variables.resource, variables.id), result);
    },
  });
}

export function useDeleteContentEntry() {
  const queryClient = useQueryClient();

  return useMutation<ContentAdminDeleteResponse, Error, DeleteContentVariables<ContentAdminResource>>({
    mutationFn: ({ resource, id }) => deleteContent(resource, id),
    onSuccess: (_result, variables) => {
      // Invalidate list queries to refresh the list view
      queryClient.invalidateQueries({
        queryKey: contentAdminQueryKeys.lists(variables.resource),
      });

      // Cancel any outgoing refetches for the detail query to avoid 404 errors after deletion
      queryClient.cancelQueries({
        queryKey: contentAdminQueryKeys.detail(variables.resource, variables.id),
      });
    },
  });
}

export function useImportContentCsv() {
  const queryClient = useQueryClient();

  return useMutation<ContentImportResponse, Error, ImportContentVariables<ContentAdminResource>>({
    mutationFn: ({ resource, file, filename, mode = 'dry-run' }) => importContentCsv(resource, file, mode, filename),
    onSuccess: (_result, variables) => {
      if (variables.mode === 'commit') {
        queryClient.invalidateQueries({
          queryKey: contentAdminQueryKeys.lists(variables.resource),
        });
      }
    },
  });
}

// --------------------
// Convenience wrappers
// --------------------

export function useItems(params?: ContentAdminListParams) {
  return useContentList('items', params);
}

export function useItem(id?: string) {
  return useContentEntry('items', id);
}

export function useCreateItem() {
  const mutation = useCreateContentEntry();

  return {
    ...mutation,
    mutate: (payload: CreateContentVariables<'items'>['payload']) => mutation.mutate({ resource: 'items', payload } as any),
    mutateAsync: (payload: CreateContentVariables<'items'>['payload']) => mutation.mutateAsync({ resource: 'items', payload } as any),
  };
}

export function useUpdateItem() {
  const mutation = useUpdateContentEntry();

  return {
    ...mutation,
    mutate: (id: string, payload: UpdateContentVariables<'items'>['payload']) => mutation.mutate({ resource: 'items', id, payload } as any),
    mutateAsync: (id: string, payload: UpdateContentVariables<'items'>['payload']) => mutation.mutateAsync({ resource: 'items', id, payload } as any),
  };
}

export function useDeleteItem() {
  const mutation = useDeleteContentEntry();

  return {
    ...mutation,
    mutate: (id: string) => mutation.mutate({ resource: 'items', id } as any),
    mutateAsync: (id: string) => mutation.mutateAsync({ resource: 'items', id } as any),
  };
}

export function useImportItemsCsv() {
  const mutation = useImportContentCsv();

  return {
    ...mutation,
    mutate: (file: File | Blob, mode?: ImportContentVariables<'items'>['mode'], filename?: string) => mutation.mutate({ resource: 'items', file, mode, filename } as any),
    mutateAsync: (file: File | Blob, mode?: ImportContentVariables<'items'>['mode'], filename?: string) => mutation.mutateAsync({ resource: 'items', file, mode, filename } as any),
  };
}

export function useSkills(params?: ContentAdminListParams) {
  return useContentList('skills', params);
}

export function useSkill(id?: string) {
  return useContentEntry('skills', id);
}

export function useCreateSkill() {
  const mutation = useCreateContentEntry();

  return {
    ...mutation,
    mutate: (payload: CreateContentVariables<'skills'>['payload']) => mutation.mutate({ resource: 'skills', payload } as any),
    mutateAsync: (payload: CreateContentVariables<'skills'>['payload']) => mutation.mutateAsync({ resource: 'skills', payload } as any),
  };
}

export function useUpdateSkill() {
  const mutation = useUpdateContentEntry();

  return {
    ...mutation,
    mutate: (id: string, payload: UpdateContentVariables<'skills'>['payload']) => mutation.mutate({ resource: 'skills', id, payload } as any),
    mutateAsync: (id: string, payload: UpdateContentVariables<'skills'>['payload']) => mutation.mutateAsync({ resource: 'skills', id, payload } as any),
  };
}

export function useDeleteSkill() {
  const mutation = useDeleteContentEntry();

  return {
    ...mutation,
    mutate: (id: string) => mutation.mutate({ resource: 'skills', id } as any),
    mutateAsync: (id: string) => mutation.mutateAsync({ resource: 'skills', id } as any),
  };
}

export function useImportSkillsCsv() {
  const mutation = useImportContentCsv();

  return {
    ...mutation,
    mutate: (file: File | Blob, mode?: ImportContentVariables<'skills'>['mode'], filename?: string) => mutation.mutate({ resource: 'skills', file, mode, filename } as any),
    mutateAsync: (file: File | Blob, mode?: ImportContentVariables<'skills'>['mode'], filename?: string) =>
      mutation.mutateAsync({ resource: 'skills', file, mode, filename } as any),
  };
}

export function useAbilities(params?: ContentAdminListParams) {
  return useContentList('abilities', params);
}

export function useAbility(id?: string) {
  return useContentEntry('abilities', id);
}

export function useCreateAbility() {
  const mutation = useCreateContentEntry();

  return {
    ...mutation,
    mutate: (payload: CreateContentVariables<'abilities'>['payload']) => mutation.mutate({ resource: 'abilities', payload } as any),
    mutateAsync: (payload: CreateContentVariables<'abilities'>['payload']) => mutation.mutateAsync({ resource: 'abilities', payload } as any),
  };
}

export function useUpdateAbility() {
  const mutation = useUpdateContentEntry();

  return {
    ...mutation,
    mutate: (id: string, payload: UpdateContentVariables<'abilities'>['payload']) => mutation.mutate({ resource: 'abilities', id, payload } as any),
    mutateAsync: (id: string, payload: UpdateContentVariables<'abilities'>['payload']) => mutation.mutateAsync({ resource: 'abilities', id, payload } as any),
  };
}

export function useDeleteAbility() {
  const mutation = useDeleteContentEntry();

  return {
    ...mutation,
    mutate: (id: string) => mutation.mutate({ resource: 'abilities', id } as any),
    mutateAsync: (id: string) => mutation.mutateAsync({ resource: 'abilities', id } as any),
  };
}

export function useImportAbilitiesCsv() {
  const mutation = useImportContentCsv();

  return {
    ...mutation,
    mutate: (file: File | Blob, mode?: ImportContentVariables<'abilities'>['mode'], filename?: string) => mutation.mutate({ resource: 'abilities', file, mode, filename } as any),
    mutateAsync: (file: File | Blob, mode?: ImportContentVariables<'abilities'>['mode'], filename?: string) =>
      mutation.mutateAsync({ resource: 'abilities', file, mode, filename } as any),
  };
}

export function useExportCount(resource: ContentAdminResource, filterOptions?: string) {
  return useQuery<ContentExportCountResponse>({
    queryKey: ['content:export:count', resource, filterOptions ?? ''],
    queryFn: () => getExportCount(resource, filterOptions),
  });
}

export function useItemsExportCount(filterOptions?: string) {
  return useExportCount('items', filterOptions);
}
