import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, tokenStore } from "@/lib/api";
import { login, me, setAuthToken, normalizeRoles } from "@tapestry/api-client";

export function useMe() {
  const token = tokenStore.get();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => me(api),
    enabled: !!token,
  });
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await login(api, input.email, input.password);
      tokenStore.set(res.token);
      setAuthToken(api, res.token);
      return res;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function logout() {
  tokenStore.clear();
  setAuthToken(api, null);
}
