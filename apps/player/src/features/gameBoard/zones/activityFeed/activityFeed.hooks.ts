import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCampaignActivity, postCampaignNote } from '@tapestry/api-client';
import type { CampaignActivity } from '@tapestry/types';

const PAGE_SIZE = 2; // Activities per page

export function useCampaignActivityFeed(campaignId: string) {
  return useInfiniteQuery({
    queryKey: ['campaign', campaignId, 'activity'],
    queryFn: ({ pageParam = 1 }) =>
      getCampaignActivity<CampaignActivity>(api, campaignId, {
        pageNumber: pageParam,
        pageLimit: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.metadata) return undefined;
      const { nextPage, pages } = lastPage.metadata;
      return nextPage <= pages ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function usePostNoteMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      await postCampaignNote(api, campaignId, content);
    },
    onSuccess: () => {
      // Invalidate to refetch - new note appears at bottom
      queryClient.invalidateQueries({
        queryKey: ['campaign', campaignId, 'activity'],
      });
    },
  });
}
