import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { CampaignStatus, CampaignType, JoinRequest } from '@tapestry/types';
import { cleanParams, getCampaign, getCampaigns, getMyCampaigns, getMyJoinRequests, ListQueryParams } from '@tapestry/api-client';
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

  return useMutation({
    mutationFn: async ({ campaignId, role, message, joinPolicy }: { campaignId: string; role: 'player' | 'observer'; message?: string; joinPolicy: 'open' | 'request' }) => {
      if (joinPolicy === 'open') {
        // Direct join for open campaigns
        const res = await api.post(`/game/campaigns/${campaignId}/join`, { role });
        return res.data;
      } else {
        // Request approval for 'request' policy
        const payload: { role: string; message?: string } = { role };
        if (message?.trim()) {
          payload.message = message.trim();
        }
        const res = await api.post(`/game/campaigns/${campaignId}/join-requests`, payload);
        return res.data;
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh campaign data and user's campaign list
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
  });
}

export function useCampaigns(params: ListQueryParams = {}) {
  const cleaned = useMemo(() => cleanParams(params), [params]);
  return useQuery({
    queryKey: ['campaigns', cleaned],
    queryFn: () => getCampaigns(api, cleaned),
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaign(api, id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch campaigns where the authenticated user is a member
 * Used for navigation and "My Campaigns" displays
 */
export function useMyCampaigns() {
  return useQuery({
    queryKey: ['my-campaigns'],
    queryFn: () => getMyCampaigns<CampaignType>(api),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch all join requests for the authenticated user
 * Used to check if user has pending requests for campaigns
 */
export function useMyJoinRequests(enabled: boolean = true) {
  return useQuery({
    queryKey: ['my-join-requests'],
    queryFn: () => getMyJoinRequests<JoinRequest>(api),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent than campaigns since status changes)
  });
}
