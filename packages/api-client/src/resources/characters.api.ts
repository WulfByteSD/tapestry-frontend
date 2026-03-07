import type { AxiosInstance } from "axios";
import { ApiListResponse, ListQueryParams, cleanParams } from "../list";

// Characters
export async function listCharacters<T>(api: AxiosInstance, params: ListQueryParams = {}): Promise<ApiListResponse<T>> {
  const res = await api.get("/game/characters", { params: cleanParams(params) });
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

export async function applyHarm(
  api: AxiosInstance,
  characterId: string,
  data: ApplyHarmData,
): Promise<ApplyHarmResponse> {
  const res = await api.post(`/game/characters/${characterId}/apply-harm`, data);
  return res.data;
}
