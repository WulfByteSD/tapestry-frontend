import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { getLegalPolicies } from "@tapestry/api-client";

export function useLegalPolicies() {
  return useQuery({
    queryKey: ["legal-policies"],
    queryFn: async () => getLegalPolicies(api),
    staleTime: 5 * 60_000,
  });
}