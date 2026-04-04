import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { CampaignStatus } from '@tapestry/types';
import { cleanParams, getCampaigns, ListQueryParams } from '@tapestry/api-client';
import { useMemo } from 'react';

export type CreateCampaignInput = {
  name: string;
  status: CampaignStatus;
  settingKey?: string;
  toneModules: string[];
  sources: string[];
  notes?: string;
};

type CreateCampaignResponse = {
  payload?: { _id?: string };
  _id?: string;
};

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const res = await api.post<CreateCampaignResponse>('/game/campaigns', input);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['storyweaver-campaigns'] });
    },
  });
}

export function useJoinCampaignMutation() {
  const queryClient = useQueryClient();
  // TODO: Implement join campaign API call and logic here

  return undefined;
}

export function useCampaigns(params: ListQueryParams = {}) {
  const cleaned = useMemo(() => cleanParams(params), [params]);
  return useQuery({
    queryKey: ['campaigns', cleaned],
    queryFn: () => getCampaigns(api, cleaned),
  });
}
