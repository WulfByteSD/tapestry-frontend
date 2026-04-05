import { AxiosInstance } from 'axios';
import { ApiListResponse, ListQueryParams } from '../list';
import { ApiResponse } from '../fetch';
import { PostNoteInput } from '@tapestry/types';

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

// ========================================
// Member Management API Methods
// ========================================

/**
 * Remove a member from a campaign
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param playerId - Player ID to remove
 */
export async function removeCampaignMember(api: AxiosInstance, campaignId: string, playerId: string): Promise<void> {
  await api.delete(`/game/campaigns/${campaignId}/members/${playerId}`);
}

/**
 * Update a member's role in a campaign
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param playerId - Player ID
 * @param role - New role ('player' | 'observer' | 'co-sw' | 'sw')
 */
export async function updateCampaignMemberRole(api: AxiosInstance, campaignId: string, playerId: string, role: string): Promise<void> {
  await api.patch(`/game/campaigns/${campaignId}/meta/members/${playerId}/role`, { role });
}

/**
 * Update a member's campaign-specific nickname
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param playerId - Player ID
 * @param nickname - New nickname (or empty string to clear)
 */
export async function updateCampaignMemberNickname(api: AxiosInstance, campaignId: string, playerId: string, nickname: string): Promise<void> {
  await api.patch(`/game/campaigns/${campaignId}/members/${playerId}/nickname`, { nickname });
}

/**
 * Transfer campaign ownership to another member (makes them SW, demotes current SW)
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param newOwnerId - Player ID of new owner
 */
export async function transferCampaignOwnership(api: AxiosInstance, campaignId: string, newOwnerId: string): Promise<void> {
  await api.post(`/game/campaigns/${campaignId}/transfer-ownership`, { newOwnerId });
}

/**
 * Archive a campaign member (soft delete, preserves history)
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param playerId - Player ID to archive
 */
export async function archiveCampaignMember(api: AxiosInstance, campaignId: string, playerId: string): Promise<void> {
  await api.post(`/game/campaigns/${campaignId}/members/${playerId}/archive`);
}

// ========================================
// Join Request Management API Methods
// ========================================

/**
 * Get all join requests for a campaign
 * Requires SW or Co-SW permissions
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 */
export async function getCampaignJoinRequests<JoinRequestType>(api: AxiosInstance, campaignId: string): Promise<ApiListResponse<JoinRequestType>> {
  const res = await api.get(`/game/campaigns/${campaignId}/join-requests`);
  return res.data as ApiListResponse<JoinRequestType>;
}

/**
 * Approve a join request and add the player to the campaign
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param requestId - Join request ID
 */
export async function approveJoinRequest(api: AxiosInstance, campaignId: string, requestId: string): Promise<void> {
  await api.post(`/game/campaigns/${campaignId}/join-requests/${requestId}/approve`);
}

/**
 * Reject a join request
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param requestId - Join request ID
 */
export async function rejectJoinRequest(api: AxiosInstance, campaignId: string, requestId: string): Promise<void> {
  await api.post(`/game/campaigns/${campaignId}/join-requests/${requestId}/deny`);
}

// ========================================
// Campaign Activity API Methods
// ========================================

/**
 * Get campaign activity feed with pagination
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param params - Pagination params (pageNumber, pageLimit)
 */
export async function getCampaignActivity<ActivityType>(api: AxiosInstance, campaignId: string, params: ListQueryParams = {}): Promise<ApiListResponse<ActivityType>> {
  const res = await api.get(`/game/campaigns/${campaignId}/activity`, { params });
  return res.data as ApiListResponse<ActivityType>;
}

/**
 * Post a storyweaver note to the activity feed
 * @param api - Axios instance
 * @param campaignId - Campaign ID
 * @param input - Note input (content and optional postType)
 */
export async function postCampaignNote(api: AxiosInstance, campaignId: string, input: PostNoteInput): Promise<void> {
  await api.post(`/game/campaigns/${campaignId}/activity`, input);
}
