import type { AxiosInstance } from "axios";

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
