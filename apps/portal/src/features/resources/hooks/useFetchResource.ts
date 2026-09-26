import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { getLibraryResource } from '@tapestry/api-client'; 
/**
 * @description uses react-query hooks to fetch a singular resource by its slug from the backend, and returns the resource data along with loading and error states
 * @returns {Object} - An object containing the resource data, loading state, and error state
 * @example
 * const { resource, isLoading, error } = useFetchResource('quickstart-guide');
 */
export function useFetchResource(slug: string) {
  const {
    data: resource,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['libraryResource', slug],
    queryFn: async () => {
      const res = await getLibraryResource(api, slug);
      return res.payload;
    },
    enabled: !!slug, // Only run the query if slug is truthy
  });
  return { resource, isLoading, error };
}
