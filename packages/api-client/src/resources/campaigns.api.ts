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
