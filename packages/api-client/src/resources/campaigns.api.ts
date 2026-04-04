import { AxiosInstance } from 'axios';
import { ApiListResponse, ListQueryParams } from '../list';
import { ApiResponse } from '../fetch';

export async function getCampaigns<CampaignType>(api: AxiosInstance, params: ListQueryParams = {}): Promise<ApiListResponse<CampaignType>> {
  const res = await api.get('/game/campaigns');
  return res.data as ApiListResponse<CampaignType>;
}

export async function getCampaign<CampaignType>(api: AxiosInstance, id: string): Promise<ApiResponse<CampaignType>> {
  const res = await api.get(`/game/campaigns/${id}`);
  return res.data as ApiResponse<CampaignType>;
}

/**
 * Get campaigns where the authenticated user is a member
 * TODO: Confirm backend endpoint - may be /game/campaigns/mine or similar
 */
export async function getMyCampaigns<CampaignType>(api: AxiosInstance): Promise<ApiListResponse<CampaignType>> {
  // TODO: Update endpoint once backend confirms the route
  // Expected endpoint: GET /game/campaigns/mine or /game/campaigns?filter=member:me
  const res = await api.get('/game/campaigns/mine');
  return res.data as ApiListResponse<CampaignType>;
}

/**
 * Get all join requests for the authenticated user
 */
export async function getMyJoinRequests<JoinRequestType>(api: AxiosInstance): Promise<ApiListResponse<JoinRequestType>> {
  const res = await api.get('/game/campaigns/join-requests/me');
  return res.data as ApiListResponse<JoinRequestType>;
}
