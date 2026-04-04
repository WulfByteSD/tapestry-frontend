import { AxiosInstance } from 'axios';
import { ApiListResponse, ListQueryParams } from '../list';

export async function getCampaigns<CampaignType>(api: AxiosInstance, params: ListQueryParams = {}): Promise<ApiListResponse<CampaignType>> {
  const res = await api.get('/game/campaigns');
  return res.data as ApiListResponse<CampaignType>;
}
