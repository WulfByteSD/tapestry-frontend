'use client';

import { useQuery } from '@tanstack/react-query';
import { listPlayers, getPlayerDetails, getPlayerCharacters, getPlayerCampaigns, fetchAuthObject } from '@tapestry/api-client';
import type { ListQueryParams } from '@tapestry/api-client';
import { api } from '@/lib/api';

/**
 * Query key factory for player admin operations
 */
export const playerAdminQueryKeys = {
  all: ['player-admin'] as const,

  lists: () => [...playerAdminQueryKeys.all, 'list'] as const,

  list: (params?: ListQueryParams) => [...playerAdminQueryKeys.lists(), params] as const,

  details: () => [...playerAdminQueryKeys.all, 'detail'] as const,

  detail: (playerId: string) => [...playerAdminQueryKeys.details(), playerId] as const,

  playerCharacters: (playerId: string, params?: ListQueryParams) => [...playerAdminQueryKeys.detail(playerId), 'characters', params] as const,

  playerCampaigns: (playerId: string, params?: ListQueryParams) => [...playerAdminQueryKeys.detail(playerId), 'campaigns', params] as const,
};

/**
 * Fetch paginated list of players with filters
 */
export function usePlayerList(params?: ListQueryParams) {
  return useQuery({
    queryKey: playerAdminQueryKeys.list(params),
    queryFn: () => listPlayers(api, params),
  });
}

/**
 * Fetch single player details with auth data
 */
export function usePlayerDetail(playerId?: string) {
  return useQuery({
    queryKey: playerAdminQueryKeys.detail(playerId || 'missing'),
    queryFn: () => getPlayerDetails(api, playerId as string),
    enabled: Boolean(playerId),
  });
}

/**
 * Fetch the player's auth object from the database
 */
export function usePlayerAuth(authId?: string) {
  return useQuery({
    queryKey: [...playerAdminQueryKeys.detail(authId || 'missing'), 'auth'] as const,
    queryFn: async () => {
      const playerRes = await fetchAuthObject(api, authId as string);
      return playerRes.payload;
    },
    enabled: Boolean(authId),
  });
}

/**
 * Fetch characters owned by a player
 */
export function usePlayerCharacters(playerId?: string, params?: ListQueryParams) {
  return useQuery({
    queryKey: playerAdminQueryKeys.playerCharacters(playerId || 'missing', params),
    queryFn: () => getPlayerCharacters(api, playerId as string, params),
    enabled: Boolean(playerId),
  });
}

/**
 * Fetch campaigns a player is involved in
 */
export function usePlayerCampaigns(playerId?: string, params?: ListQueryParams) {
  return useQuery({
    queryKey: playerAdminQueryKeys.playerCampaigns(playerId || 'missing', params),
    queryFn: () => getPlayerCampaigns(api, playerId as string, params),
    enabled: Boolean(playerId),
  });
}
