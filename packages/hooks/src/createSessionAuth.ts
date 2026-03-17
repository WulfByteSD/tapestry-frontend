import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { createTokenStore, login, me, setAuthToken } from "@tapestry/api-client";

type TokenStore = ReturnType<typeof createTokenStore>;

type SessionAuthOptions = {
  useOnLoginError?: () => ((error: Error) => void) | undefined;
  loginErrorLogLabel?: string;
};

export function createSessionAuth(api: AxiosInstance, tokenStore: TokenStore, options?: SessionAuthOptions) {
  function useLogout() {
    const qc = useQueryClient();

    return useCallback(() => {
      tokenStore.clear();
      setAuthToken(api, null);
      qc.setQueryData(["me"], null);
      qc.removeQueries({ queryKey: ["profile"] });
    }, [qc]);
  }

  function useMe() {
    return useQuery({
      queryKey: ["me"],
      queryFn: async () => {
        const token = tokenStore.get();

        if (!token) {
          return null;
        }

        return me(api);
      },
      retry: false,
      staleTime: 60_000,
    });
  }

  function useLogin() {
    const qc = useQueryClient();
    const handleLoginError = options?.useOnLoginError?.();

    return useMutation({
      mutationFn: async (input: { email: string; password: string }) => {
        const res = await login(api, input.email, input.password);
        tokenStore.set(res.token);
        setAuthToken(api, res.token);
        const user = await me(api);
        return { res, user };
      },
      onSuccess: ({ user }) => {
        qc.setQueryData(["me"], user);
      },
      onError: (error) => {
        console.error(options?.loginErrorLogLabel || "Login error:", error);
        handleLoginError?.(error as Error);
      },
    });
  }

  function logout() {
    tokenStore.clear();
    setAuthToken(api, null);
  }

  return {
    useLogout,
    useMe,
    useLogin,
    logout,
  };
}
