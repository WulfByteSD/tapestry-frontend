import type { AxiosInstance } from 'axios';
import type { CharacterRequest, CharacterSheet } from '@tapestry/types';
import { ApiListResponse, ListQueryParams, cleanParams } from '../list';

// Characters
export async function listCharacters<T>(api: AxiosInstance, params: ListQueryParams = {}): Promise<ApiListResponse<T>> {
  const res = await api.get('/game/characters', { params: cleanParams(params) });
  return res.data;
}

export type ApplyHarmData = {
  incomingHarm: number;
  useTempFirst?: boolean;
};

export type ApplyHarmResponse = {
  success: boolean;
  payload: {
    incomingHarm: number;
    protection: number;
    appliedHarm: number;
    hpBefore: number;
    hpAfter: number;
    tempBefore: number;
    tempAfter: number;
  };
};

export async function applyHarm(api: AxiosInstance, characterId: string, data: ApplyHarmData): Promise<ApplyHarmResponse> {
  const res = await api.post(`/game/characters/${characterId}/apply-harm`, data);
  return res.data;
}

// Delete character
export async function deleteCharacter(api: AxiosInstance, characterId: string): Promise<{ _id: string }> {
  const res = await api.delete(`/game/characters/${characterId}`);
  return res.data;
}

// --- Campaign-scoped character management ---

export async function getCampaignCharacters(api: AxiosInstance, campaignId: string): Promise<CharacterSheet[]> {
  const res = await api.get(`/game/campaigns/${campaignId}/characters`);
  return res.data;
}

export async function getCampaignCharacterRequests(api: AxiosInstance, campaignId: string): Promise<CharacterRequest[]> {
  const res = await api.get(`/game/campaigns/${campaignId}/character-requests`);
  return res.data;
}

export async function requestCharacterAttachment(
  api: AxiosInstance,
  campaignId: string,
  data: { characterId: string; message?: string },
): Promise<CharacterRequest> {
  const res = await api.post(`/game/campaigns/${campaignId}/character-requests`, data);
  return res.data;
}

export async function approveCharacterRequest(
  api: AxiosInstance,
  campaignId: string,
  requestId: string,
): Promise<CharacterRequest> {
  const res = await api.post(`/game/campaigns/${campaignId}/character-requests/${requestId}/approve`);
  return res.data;
}

export async function rejectCharacterRequest(
  api: AxiosInstance,
  campaignId: string,
  requestId: string,
): Promise<CharacterRequest> {
  const res = await api.post(`/game/campaigns/${campaignId}/character-requests/${requestId}/reject`);
  return res.data;
}

export async function attachDMPC(
  api: AxiosInstance,
  campaignId: string,
  data: { characterId: string },
): Promise<CharacterSheet> {
  const res = await api.post(`/game/campaigns/${campaignId}/characters`, data);
  return res.data;
}

export async function detachCharacter(
  api: AxiosInstance,
  campaignId: string,
  characterId: string,
): Promise<{ _id: string }> {
  const res = await api.delete(`/game/campaigns/${campaignId}/characters/${characterId}`);
  return res.data;
}
