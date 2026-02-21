import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, tokenStore } from "@/lib/api";
import { login, me, setAuthToken, normalizeRoles, register } from "@tapestry/api-client";

export function useLogout() {
  const qc = useQueryClient();

  return () => {
    tokenStore.clear();
    setAuthToken(api, null);
    qc.setQueryData(["me"], null);
  };
}
// auth-hooks.ts
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const token = tokenStore.get();
      if (!token) return null; // <- no token: no request, not an error
      return me(api); // <- token: hit /auth/me
    },
    retry: false,
    staleTime: 60_000,
  });
}
export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const res = await login(api, input.email, input.password);
      tokenStore.set(res.token);
      setAuthToken(api, res.token);
      // Fetch the profile immediately
      const profile = await me(api);
      return { res, profile };
    },
    onSuccess: async ({ profile }) => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      qc.setQueryData(["me"], profile); // <- THIS is the important line
    },
  });
}

export function logout() {
  tokenStore.clear();
  setAuthToken(api, null);
}
export function useRegister() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      firstName: string;
      lastName?: string;
      email: string;
      phoneNumber: string;
      password: string;
      roles?: string[];
    }) => {
      const res = await register(api, input);

      // If your register endpoint returns token like login, treat it the same:
      tokenStore.set(res.token);
      setAuthToken(api, res.token);

      const profile = await me(api);
      return { res, profile };
    },
    onSuccess: ({ profile }) => {
      qc.setQueryData(["me"], profile);
    },
  });
}
