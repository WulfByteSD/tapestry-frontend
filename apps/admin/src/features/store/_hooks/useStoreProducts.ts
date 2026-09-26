'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCommerceProduct, deleteCommerceProduct, getAdminProduct, getAdminProducts, getLibraryResources, updateCommerceProduct } from '@tapestry/api-client';
import type { CreateProductInput, LibraryResourceSummary } from '@tapestry/types';
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

export const storeQueryKeys = {
  all: ['store'] as const,
  adminProducts: ['store', 'admin', 'products'] as const,
  adminProductsList: (params?: ListQueryParams) => [...storeQueryKeys.adminProducts, 'list', normalizeListParams(params)] as const,
  adminProduct: (id: string) => ['store', 'admin', 'product', id] as const,
  libraryResources: (params?: ListQueryParams) => ['store', 'library', 'resources', normalizeListParams(params)] as const,
};

export function useStoreProducts(params?: ListQueryParams) {
  return useQuery({
    queryKey: storeQueryKeys.adminProductsList(params),
    queryFn: () => getAdminProducts(api, params),
  });
}

export function useStoreProduct(id?: string) {
  return useQuery({
    queryKey: storeQueryKeys.adminProduct(id || 'missing'),
    queryFn: () => getAdminProduct(api, id as string),
    enabled: Boolean(id),
  });
}

export function useLibraryResources(params?: ListQueryParams) {
  return useQuery({
    queryKey: storeQueryKeys.libraryResources(params),
    queryFn: () => getLibraryResources(api, params),
  });
}

export function useCreateStoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductInput) => createCommerceProduct(api, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: storeQueryKeys.adminProducts,
      });
    },
  });
}

export function useUpdateStoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProductInput> }) => updateCommerceProduct(api, id, payload),
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: storeQueryKeys.adminProducts,
      });

      queryClient.setQueryData(storeQueryKeys.adminProduct(variables.id), result);
    },
  });
}

export function useDeleteStoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCommerceProduct(api, id),
    onSuccess: async (_result, id) => {
      await queryClient.invalidateQueries({
        queryKey: storeQueryKeys.adminProducts,
      });

      queryClient.removeQueries({
        queryKey: storeQueryKeys.adminProduct(id),
      });
    },
  });
}

export function createLibraryResourceOptionLabel(resource: LibraryResourceSummary) {
  return `${resource.title} (${resource.key}) - ${resource.status}`;
}
