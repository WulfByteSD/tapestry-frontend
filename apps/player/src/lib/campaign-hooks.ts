import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { CampaignStatus, CampaignType, JoinRequest, SettingDefinition } from '@tapestry/types';
import {
  cleanParams,
  getCampaign,
  getCampaigns,
  getMyCampaigns,
  getMyJoinRequests,
  getCampaignJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  ListQueryParams,
  removeCampaignMember,
  updateCampaignMemberRole,
  updateCampaignMemberNickname,
  transferCampaignOwnership,
  archiveCampaignMember,
  deleteCampaign,
  getSettings,
  ApiResponse,
  UpdatePayload,
} from '@tapestry/api-client';
import { useMemo } from 'react';
import applyDotUpdates from '@/utils/applyDotUpdates';

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

/**
 * Remove a member from a campaign
 * Requires SW or Co-SW permissions
 */
export function useRemoveMemberMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerId }: { playerId: string }) => {
      await removeCampaignMember(api, campaignId, playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
  });
}

/**
 * Update a member's role in a campaign
 * Requires SW or Co-SW permissions
 */
export function useUpdateMemberRoleMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerId, role }: { playerId: string; role: 'sw' | 'co-sw' | 'player' | 'observer' }) => {
      await updateCampaignMemberRole(api, campaignId, playerId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });
}

/**
 * Update a member's nickname in a campaign
 * Requires SW or Co-SW permissions
 */
export function useUpdateMemberNicknameMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerId, nickname }: { playerId: string; nickname: string }) => {
      await updateCampaignMemberNickname(api, campaignId, playerId, nickname);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });
}

/**
 * Transfer campaign ownership to another member
 * Only available to current primary Storyweaver
 */
export function useTransferOwnershipMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ newOwnerId }: { newOwnerId: string }) => {
      await transferCampaignOwnership(api, campaignId, newOwnerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
  });
}

/**
 * Archive a member from a campaign
 * Requires SW or Co-SW permissions
 */
export function useArchiveMemberMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ playerId }: { playerId: string }) => {
      await archiveCampaignMember(api, campaignId, playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    },
  });
}

/**
 * Fetch all join requests for a specific campaign
 * Used by Storyweavers to review pending requests
 */
export function useCampaignJoinRequests(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['campaign', campaignId, 'join-requests'],
    queryFn: () => getCampaignJoinRequests<JoinRequest>(api, campaignId!),
    enabled: !!campaignId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Approve a join request and add the player to the campaign
 * Requires SW or Co-SW permissions
 */
export function useApproveJoinRequestMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      await approveJoinRequest(api, campaignId, requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId, 'join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
    },
  });
}

/**
 * Reject a join request
 * Requires SW or Co-SW permissions
 */
export function useRejectJoinRequestMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      await rejectJoinRequest(api, campaignId, requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId, 'join-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-join-requests'] });
    },
  });
}

/**
 * Fetch published settings (for campaign creation/configuration)
 * Returns available setting definitions for table setup
 */
export function useSettingsQuery() {
  return useQuery({
    queryKey: ['content:settings'],
    queryFn: async () => {
      return await getSettings(api, {
        pageLimit: 50,
        sortOptions: 'name',
        filterOptions: 'status;published',
      });
    },
    staleTime: 60_000, // Settings don't change frequently
    retry: 1,
  });
}

// Timer map to debounce refetches after mutations settle
const refetchTimers = new Map<string, number>();

/**
 * Update campaign fields with optimistic updates and debounced refetch
 * Supports dot notation for nested updates
 * Requires SW or Co-SW permissions
 */
export function useUpdateCampaignMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['campaign:update', campaignId],
    mutationFn: async (updates: UpdatePayload) => {
      const res = await api.put(`/game/campaigns/${campaignId}`, updates);
      return res.data as ApiResponse<any>;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['campaign', campaignId] });

      const prev = queryClient.getQueryData<ApiResponse<any>>(['campaign', campaignId]);

      if (prev?.payload) {
        queryClient.setQueryData<ApiResponse<any>>(['campaign', campaignId], {
          ...prev,
          payload: applyDotUpdates(prev.payload, updates),
        });
      }

      return { prev };
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['campaign', campaignId], ctx.prev);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['campaign', campaignId], data);

      // Clear any existing refetch timer
      const existingTimer = refetchTimers.get(campaignId);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }

      // Set a new timer to refetch after updates have settled (2000ms)
      const timer = window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
        queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
        refetchTimers.delete(campaignId);
      }, 2000);

      refetchTimers.set(campaignId, timer);
    },
  });
}

/**
 * Permanently delete a campaign
 * Only available to primary Storyweaver
 */
export function useDeleteCampaignMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await deleteCampaign(api, campaignId);
    },
    onSuccess: () => {
      // Invalidate all campaign queries
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['storyweaver-campaigns'] });
      // Remove the specific campaign from cache
      queryClient.removeQueries({ queryKey: ['campaign', campaignId] });
    },
  });
}
