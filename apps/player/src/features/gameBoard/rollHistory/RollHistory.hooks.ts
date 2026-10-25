import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignRolls } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { rollAccessError, rollHistoryKey } from './RollHistory.helpers';
import type { RollHistoryProps } from './RollHistory.types';

export const ROLLS_PER_PAGE = 25;

export function useRollHistory({ campaignId, currentUserId }: RollHistoryProps) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [...rollHistoryKey(campaignId, currentUserId), page],
    queryFn: () => getCampaignRolls(api, campaignId, { pageNumber: page, pageLimit: ROLLS_PER_PAGE, sortOptions: '-rolledAt;-_id' }),
    enabled: Boolean(campaignId && currentUserId),
    staleTime: 10000,
    refetchInterval: (state) => rollAccessError(state.state.error) ? false : 15000,
    refetchIntervalInBackground: false,
    retry: (count, error) => !rollAccessError(error) && count < 2,
  });
  // Never render cached entries after a failed authorization or refresh.
  const data = query.isError ? undefined : query.data;
  const refresh = () => { if (page !== 1) setPage(1); else void query.refetch(); };
  return { query, data, page, setPage, refresh };
}
