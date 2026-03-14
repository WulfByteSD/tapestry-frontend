import { AxiosInstance } from "axios";

export type LegalDoc = {
  _id: string;
  type: string;
  title: string;
  version: number;
  effective_date?: string;
  slug?: string;
  summary?: string;
};

export async function getLegalPolicies(api: AxiosInstance) {
  const res = await api.get("/auth/legal");
  return res.data.payload as LegalDoc[];
}
