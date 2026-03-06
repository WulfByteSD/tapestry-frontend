import type { AxiosInstance } from "axios";
import type { ApiListResponse, ListQueryParams } from "../list/list.types";
import { cleanParams } from "../list/list.utils";
import { ItemDefinition, SettingDefinition } from "../../../types/src/content";
type ApiResponse<T> = {
  success: boolean;
  payload: T;
  message?: string;
};
export async function getSettings(
  api: AxiosInstance,
  params?: ListQueryParams,
): Promise<ApiListResponse<SettingDefinition>> {
  const res = await api.get("/game/content/settings", {
    params: cleanParams(params || {}),
  });
  return res.data;
}

export async function getSettingByKey(api: AxiosInstance, key: string): Promise<ApiResponse<SettingDefinition>> {
  const res = await api.get(`/game/content/settings/by-key/${encodeURIComponent(key)}`);
  return res.data;
}

export async function getItems(api: AxiosInstance, params?: ListQueryParams): Promise<ApiListResponse<ItemDefinition>> {
  const res = await api.get("/game/content/items", {
    params: cleanParams(params || {}),
  });
  return res.data;
}

export async function getItemByKey(api: AxiosInstance, key: string): Promise<ApiResponse<ItemDefinition>> {
  const res = await api.get(`/game/content/items/by-key/${encodeURIComponent(key)}`);
  return res.data;
}
