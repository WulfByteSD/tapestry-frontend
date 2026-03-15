import { AxiosInstance } from "axios";
import { cleanParams, ListQueryParams } from "../list";

export type BecomeStoryweaverInput = {
  officialLoreOptIn: boolean;
};

export async function becomeStoryweaver(api: AxiosInstance, input: BecomeStoryweaverInput) {
  const res = await api.post("/game/storyweaver/become", input);
  return res.data.payload;
}

export async function getStoryweaverCampaigns(api: AxiosInstance, params: ListQueryParams = {}) {
  const res = await api.get("/game/campaigns", { params: cleanParams(params) });
  return res.data;
}
