// apps/player/src/features/storyweaver/campaignBoardScreen/campaignBoard.queries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { api, tokenStore } from "@/lib/api";
import type { CampaignType, SettingDefinition } from "@tapestry/types";
import { getSettings } from "@tapestry/api-client";
import type { ApiListResponse } from "@tapestry/api-client/src/list/list.types";

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

export function useSettingsQuery() {
  const hasToken = typeof window !== "undefined" && !!tokenStore.get();

  return useQuery({
    queryKey: ["content:settings"],
    enabled: hasToken,
    queryFn: async () => {
      return await getSettings(api, {
        pageLimit: 50,
        sortOptions: "name",
        filterOptions: "status;published",
      });
    },
    staleTime: 60_000, // Settings don't change frequently
    retry: 1,
  });
}
