// apps/player/src/features/characters/CharacterSheetScreen/characterSheet.queries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api, tokenStore } from "@/lib/api";

export type ApiResponse<T> = {
  success: boolean;
  payload: T;
  message?: string;
};

export function useCharacterSheetQuery<T>(characterId: string) {
  const hasToken = typeof window !== "undefined" && !!tokenStore.get();

  return useQuery({
    queryKey: ["character", characterId],
    enabled: hasToken && !!characterId,
    queryFn: async () => {
      const res = await api.get(`/game/characters/${characterId}`);
      return res.data as ApiResponse<T>;
    },
    staleTime: 15_000,
    retry: 1,
  });
}
