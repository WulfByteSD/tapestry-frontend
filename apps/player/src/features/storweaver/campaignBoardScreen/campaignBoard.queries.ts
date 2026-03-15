// apps/player/src/features/storyweaver/campaignBoardScreen/campaignBoard.queries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api, tokenStore } from "@/lib/api";
import type { CampaignType } from "@tapestry/types";

export type ApiResponse<T> = {
  success: boolean;
  payload: T;
  message?: string;
};

export function useCampaignQuery(campaignId: string) {
  const hasToken = typeof window !== "undefined" && !!tokenStore.get();

  return useQuery({
    queryKey: ["campaign", campaignId],
    enabled: hasToken && !!campaignId,
    queryFn: async () => {
      const res = await api.get(`/game/campaigns/${campaignId}`);
      return res.data as ApiResponse<CampaignType & { _id: string }>;
    },
    staleTime: 15_000,
    retry: 1,
  });
}
