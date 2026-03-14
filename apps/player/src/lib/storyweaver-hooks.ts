import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { becomeStoryweaver } from "@tapestry/api-client";
import { useAlert } from "@tapestry/ui";
import { useMe } from "./auth-hooks";

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
