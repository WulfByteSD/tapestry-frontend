import { useMutation, useQueryClient } from "@tanstack/react-query";
import { me, register, setAuthToken } from "@tapestry/api-client";
import { useAlert } from "@tapestry/ui";
import { createSessionAuth } from "@tapestry/hooks";
import { api, tokenStore } from "@/lib/api";

function useLoginErrorHandler() {
  const { addAlert } = useAlert();

  return () => {
    addAlert({
      type: "error",
      message: "Login failed. Please check your credentials and try again.",
    });
  };
}

const sessionAuth = createSessionAuth(api, tokenStore, {
  useOnLoginError: useLoginErrorHandler,
  loginErrorLogLabel: "Login error:",
});

export const { useLogout, useMe, useLogin, logout } = sessionAuth;

export function useRegister() {
  const qc = useQueryClient();
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async (input: {
      auth: {
        email: string;
        password: string;
      };
      player: {
        firstName: string;
        lastName: string;
        country: string;
        region: string;
        displayName: string;
        bio?: string;
        timezone?: string;
        roles: string[];
      };
    }) => {
      const res = await register(api, input);

      tokenStore.set(res.token);
      setAuthToken(api, res.token);

      const profile = await me(api);
      return { res, profile };
    },
    onSuccess: ({ profile }) => {
      qc.setQueryData(["me"], profile);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      addAlert({ type: "error", message: `Registration failed. Please try again. Error: ${error.message}` });
    },
  });
}
