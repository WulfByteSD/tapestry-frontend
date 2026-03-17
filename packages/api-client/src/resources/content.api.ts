import type { AxiosInstance } from "axios";
import type { ApiListResponse, ListQueryParams } from "../list/list.types";
import { cleanParams } from "../list/list.utils";
import { ItemDefinition, LoreNode, SettingDefinition, SkillDefinition } from "../../../types/src/content";
import { AbilityDefinition, GrantedAbilityRef } from "../../../types/src";
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

export async function getSkillsForSetting(
  api: AxiosInstance,
  settingKey: string,
): Promise<ApiListResponse<SkillDefinition>> {
  const res = await api.get(`/game/content/skills/setting/${encodeURIComponent(settingKey)}`);
  return res.data;
}

export async function getAbilitiesForSetting(
  api: AxiosInstance,
  settingKey: string,
): Promise<ApiListResponse<AbilityDefinition>> {
  const res = await api.get(`/game/content/abilities/setting/${encodeURIComponent(settingKey)}`, {
    params: {
      sourceType: "learned,innate",
    },
  });
  return res.data;
}

export async function getAbilityByKey(api: AxiosInstance, key: string): Promise<ApiResponse<AbilityDefinition>> {
  const res = await api.get(`/game/content/abilities/by-key/${encodeURIComponent(key)}`);
  return res.data;
}
// packages/api-client/src/resources/content.api.ts
export async function createSetting(api: AxiosInstance, payload: Partial<SettingDefinition>) {
  const res = await api.post("/game/content/settings", payload);
  return res.data;
}

export async function updateSetting(api: AxiosInstance, id: string, payload: Partial<SettingDefinition>) {
  const res = await api.put(`/game/content/settings/${id}`, payload);
  return res.data;
}

export async function createItem(api: AxiosInstance, payload: Partial<ItemDefinition>) {
  const res = await api.post("/game/content/items", payload);
  return res.data;
}

export async function updateItem(api: AxiosInstance, id: string, payload: Partial<ItemDefinition>) {
  const res = await api.put(`/game/content/items/${id}`, payload);
  return res.data;
}

export async function createSkill(api: AxiosInstance, payload: Partial<SkillDefinition>) {
  const res = await api.post("/game/content/skills", payload);
  return res.data;
}

export async function createAbility(api: AxiosInstance, payload: Partial<AbilityDefinition>) {
  const res = await api.post("/game/content/abilities", payload);
  return res.data;
}

export async function getLoreTree(api: AxiosInstance, settingKey: string) {
  const res = await api.get(`/game/content/lore/tree/${encodeURIComponent(settingKey)}`);
  return res.data;
}

export async function createLoreNode(api: AxiosInstance, payload: Partial<LoreNode>) {
  const res = await api.post("/game/content/lore", payload);
  return res.data;
}

export async function updateLoreNode(api: AxiosInstance, id: string, payload: Partial<LoreNode>) {
  const res = await api.put(`/game/content/lore/${id}`, payload);
  return res.data;
}
