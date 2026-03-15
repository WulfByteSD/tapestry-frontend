// apps/player/src/features/storyweaver/campaignBoardScreen/campaignBoard.mutations.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ApiResponse, UpdatePayload } from "@tapestry/api-client";
import applyDotUpdates from "@/utils/applyDotUpdates";

export function useUpdateCampaignMutation(campaignId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["campaign:update", campaignId],
    mutationFn: async (updates: UpdatePayload) => {
      const res = await api.put(`/game/campaigns/${campaignId}`, updates);
      return res.data as ApiResponse<any>;
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["campaign", campaignId] });

      const prev = qc.getQueryData<ApiResponse<any>>(["campaign", campaignId]);

      if (prev?.payload) {
        qc.setQueryData<ApiResponse<any>>(["campaign", campaignId], {
          ...prev,
          payload: applyDotUpdates(prev.payload, updates),
        });
      }

      return { prev };
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(["campaign", campaignId], ctx.prev);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(["campaign", campaignId], data);
      qc.invalidateQueries({ queryKey: ["storyweaver-campaigns"] });
    },
  });
}
