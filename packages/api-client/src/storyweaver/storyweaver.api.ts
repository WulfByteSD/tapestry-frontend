import { AxiosInstance } from "axios";

export type BecomeStoryweaverInput = {
  officialLoreOptIn: boolean;
};

export async function becomeStoryweaver(api: AxiosInstance, input: BecomeStoryweaverInput) {
  const res = await api.post("/storyweaver/become", input);
  return res.data.payload;
}
