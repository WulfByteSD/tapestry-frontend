import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import type { SettingDefinition } from '@tapestry/types';
import type { ApiListResponse, ListQueryParams } from '@tapestry/api-client';

export interface UseSettingsOptions extends ListQueryParams {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  retry?: number | boolean;
}

/**
 * Custom hook to fetch settings (content definitions for game worlds/settings)
 * Uses React Query for caching and state management
 *
 * @param api - The axios instance to use for API calls
 * @param options - Optional query parameters and React Query configuration
 * @returns UseQueryResult containing settings list response
 *
 * @example
 * ```tsx
 * import { useSettings } from '@tapestry/hooks';
 * import { api } from '@/lib/api';
 *
 * function SettingsDropdown() {
 *   const { data, isLoading } = useSettings(api, {
 *     filterOptions: 'status;published',
 *     sortOptions: 'name'
 *   });
 *   const settings = data?.payload ?? [];
 *   // ...
 * }
 * ```
 */
export function useSettings(api: AxiosInstance, options: UseSettingsOptions = {}): UseQueryResult<ApiListResponse<SettingDefinition>> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 1000 * 60 * 5, // 5 minutes
    gcTime = 1000 * 60 * 10, // 10 minutes
    refetchInterval,
    retry = 1,
    ...queryParams
  } = options;

  return useQuery({
    queryKey: ['settings', queryParams],
    queryFn: async () => {
      const params: Record<string, any> = {};

      if (queryParams.keyword) params.keyword = queryParams.keyword;
      if (queryParams.filterOptions) params.filterOptions = queryParams.filterOptions;
      if (queryParams.includeOptions) params.includeOptions = queryParams.includeOptions;
      if (queryParams.sortOptions) params.sortOptions = queryParams.sortOptions;
      if (queryParams.pageNumber) params.pageNumber = queryParams.pageNumber;
      if (queryParams.pageLimit) params.pageLimit = queryParams.pageLimit;

      const { data } = await api.get('/game/content/settings', { params });
      return data as ApiListResponse<SettingDefinition>;
    },
    enabled,
    refetchOnWindowFocus,
    staleTime,
    gcTime,
    refetchInterval,
    retry,
  });
}
