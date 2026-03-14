import { AxiosInstance } from "axios";
import { LegalType } from "../../../types/src";

export async function getLegalPolicies(api: AxiosInstance) {
  const res = await api.get("/auth/legal");
  return res.data.payload as LegalType[];
}

export async function getLegalPolicyByType(api: AxiosInstance, type: string) {
  const res = await api.get(`/auth/legal/${type}`);
  return res.data.payload as LegalType;
}
