import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { becomeStoryweaver, getStoryweaverCampaigns } from "@tapestry/api-client";
import { useAlert } from "@tapestry/ui";
import { useMe } from "./auth-hooks";
import { ApiResponse } from "@/features/characters/characterSheetScreen/characterSheet.queries";
import { CampaignType } from "@tapestry/types";

export function useBecomeStoryweaver() {
  const qc = useQueryClient();
  const { addAlert } = useAlert();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (input: { officialLoreOptIn: boolean }) => becomeStoryweaver(api, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.invalidateQueries({ queryKey: ["profile", "player", me?.profileRefs?.player] });
      addAlert({
        type: "success",
        message: "Storyweaver access enabled.",
      });
    },
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to enable Storyweaver access.",
      });
    },
  });
}

export function useStoryweaverCampaigns() {
  return useQuery({
    queryKey: ["storyweaver-campaigns"],
    queryFn: async () => {
      return await getStoryweaverCampaigns(api); 
    },
    staleTime: 60_000,
  });
}
