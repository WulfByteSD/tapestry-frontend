import type { AxiosInstance } from 'axios';
import type { ApiListResponse, ListQueryParams } from '../list/list.types';
import type { ApiResponse } from '../fetch/fetch.types';
import { cleanParams } from '../list/list.utils';
import type { PlayerWithAuth } from '../../../types/src/players';

/**
 * Admin API functions for player management
 */

export async function listPlayers(api: AxiosInstance, params?: ListQueryParams): Promise<ApiListResponse<PlayerWithAuth>> {
  const res = await api.get('/profiles/player', { params: cleanParams(params || {}) });
  return res.data;
}

export async function getPlayerDetails(api: AxiosInstance, playerId: string): Promise<ApiResponse<PlayerWithAuth>> {
  const res = await api.get(`/profiles/player/${playerId}`);
  return res.data;
}

export async function getPlayerCharacters<T = any>(api: AxiosInstance, playerId: string, params?: ListQueryParams): Promise<ApiListResponse<T>> {
  const res = await api.get(`/game/characters`, { params: cleanParams(params || {}) });
  return res.data;
}

export async function getPlayerCampaigns<T = any>(api: AxiosInstance, playerId: string, params?: ListQueryParams): Promise<ApiListResponse<T>> {
  const res = await api.get(`/game/campaigns`, { params: cleanParams(params || {}) });
  return res.data;
}
