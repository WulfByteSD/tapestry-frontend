import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { CampaignStatus } from "@tapestry/types";

export type CreateCampaignInput = {
  name: string;
  status: CampaignStatus;
  settingKey?: string;
  toneModules: string[];
  sources: string[];
  notes?: string;
};

type CreateCampaignResponse = {
  payload?: { _id?: string };
  _id?: string;
};

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const res = await api.post<CreateCampaignResponse>("/game/campaigns", input);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["storyweaver-campaigns"] });
    },
  });
}
