import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CharacterSheet, CharacterRequest } from '@tapestry/types';
import { api, tokenStore } from '@/lib/api';
import {
  cleanParams,
  listCharacters,
  getCampaignCharacters,
  getCampaignCharacterRequests,
  getMyCharacterRequests,
  requestCharacterAttachment,
  approveCharacterRequest,
  rejectCharacterRequest,
  attachDMPC,
  detachCharacter,
  type ListQueryParams,
} from '@tapestry/api-client';
import { useMe } from './auth-hooks';
import { useProfile } from '@tapestry/hooks/src/useProfile';

export function useCharacterSheetsQuery(params: ListQueryParams = {}) {
  const cleaned = useMemo(() => cleanParams(params), [params]);
  const { data: me } = useMe();
  const { data: profile } = useProfile(api, me, 'player');

  return useQuery({
    queryKey: ['characters', cleaned],
    queryFn: () => listCharacters<CharacterSheet>(api, cleaned),
    enabled: !!profile, // don’t hammer 401s if user isn’t logged in
    staleTime: 30_000,
    retry: 1,
  });
}
// --- Campaign character queries ---

export function useCampaignCharacters(campaignId: string) {
  return useQuery({
    queryKey: ['campaign', campaignId, 'characters'],
    queryFn: () => getCampaignCharacters(api, campaignId),
    enabled: !!campaignId,
    staleTime: 30_000,
  });
}

export function useCampaignCharacterRequests(campaignId: string, isSW: boolean) {
  return useQuery({
    queryKey: ['campaign', campaignId, 'character-requests'],
    queryFn: () => getCampaignCharacterRequests(api, campaignId),
    enabled: !!campaignId && isSW, // only SW needs all character requests
    staleTime: 15_000,
  });
}

export function useMyCharacterRequests(campaignId: string) {
  return useQuery({
    queryKey: ['campaign', campaignId, 'character-requests', 'me'],
    queryFn: () => getMyCharacterRequests(api, campaignId),
    enabled: !!campaignId,
    staleTime: 15_000,
  });
}

// --- Campaign character mutations ---

export function useRequestCharacterAttachmentMutation(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { characterId: string; message?: string }) => requestCharacterAttachment(api, campaignId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'characters'] });
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'character-requests'] });
    },
  });
}

export function useApproveCharacterRequestMutation(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => approveCharacterRequest(api, campaignId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'characters'] });
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'character-requests'] });
    },
  });
}

export function useRejectCharacterRequestMutation(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => rejectCharacterRequest(api, campaignId, requestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'character-requests'] });
    },
  });
}

export function useAttachDMPCMutation(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { characterId: string }) => attachDMPC(api, campaignId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'characters'] });
    },
  });
}

export function useDetachCharacterMutation(campaignId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (characterId: string) => detachCharacter(api, campaignId, characterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaign', campaignId, 'characters'] });
    },
  });
}
