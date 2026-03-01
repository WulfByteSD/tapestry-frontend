import type { AxiosInstance } from "axios";
import type { ListQueryParams, ApiListResponse } from "../list/list.types";
import { cleanParams } from "../list/list.utils";

export interface CreateRollData {
  characterId?: string | null;
  playerId: string;
  campaignId?: string | null;

  // Dice parameters
  diceCount?: number;
  faces: number;

  // Semantic game mechanics (Tapestry rules)
  edge?: boolean;
  burden?: boolean;

  // Explicit overrides (for custom scenarios)
  keepBest?: number;
  keepWorst?: number;
  operations?: Array<{ operator: "+" | "-" | "*" | "/"; value: number }>;

  // Metadata
  rollType?: string;
  context?: string;
  aspectUsed?: string;
}

export async function createRoll<T = any>(api: AxiosInstance, data: CreateRollData): Promise<T> {
  const res = await api.post<T>("/game/rolls", data);
  return res.data;
}

export async function getRolls(
  api: AxiosInstance,
  params?: ListQueryParams
): Promise<ApiListResponse<any>> {
  const res = await api.get("/game/rolls", { params: cleanParams(params || {}) });
  return res.data;
}
