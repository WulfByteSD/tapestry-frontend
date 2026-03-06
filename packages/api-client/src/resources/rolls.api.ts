import type { AxiosInstance } from "axios";
import type { ListQueryParams, ApiListResponse } from "../list/list.types";
import { cleanParams } from "../list/list.utils";  

export interface RollOperation {
  operator: "+" | "-" | "*" | "/";
  value: number;
}

export interface AttackRollInput {
  targetNumber: number;
  targetLabel?: string;

  /**
   * Character-owned item instance
   */
  weaponInstanceId?: string | null;

  /**
   * Canonical content-library key
   */
  itemKey?: string | null;

  /**
   * Snapshot for historical truth
   */
  weaponNameSnapshot?: string;
  attackProfileKey?: string | null;
  attackNameSnapshot?: string | null;
}

export interface AttackResolution {
  targetNumber: number;
  margin: number;
  outcome: "miss" | "weak_hit" | "hit" | "strong_hit";
  targetLabel?: string;
  weaponInstanceId?: string | null;
  itemKey?: string | null;
  weaponNameSnapshot?: string;
  attackProfileKey?: string | null;
  attackNameSnapshot?: string | null;
}

export interface CreateRollData {
  characterId?: string | null;
  playerId: string;
  campaignId?: string | null;

  diceCount?: number;
  faces: number;

  edge?: boolean;
  burden?: boolean;

  keepBest?: number;
  keepWorst?: number;
  operations?: RollOperation[];

  rollType?: string;
  context?: string;
  aspectUsed?: string;

  /**
   * Present when rollType === "attack"
   */
  attack?: AttackRollInput;
}

export interface RollPayload {
  rollId: string;
  expression: string;
  allRolls: number[];
  keptRolls: number[];
  total: number;
  breakdown?: string;
  attack?: AttackResolution;
}

export async function createRoll(
  api: AxiosInstance,
  data: CreateRollData,
): Promise<{ success: boolean; payload: RollPayload }> {
  const res = await api.post("/game/rolls", data);
  return res.data;
}

export async function getRolls(api: AxiosInstance, params?: ListQueryParams): Promise<ApiListResponse<any>> {
  const res = await api.get("/game/rolls", {
    params: cleanParams(params || {}),
  });
  return res.data;
}
