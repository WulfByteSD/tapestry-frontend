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
  loginErrorLogLabel: "Admin login error:",
});

export const { useLogout, useMe, useLogin, logout } = sessionAuth;
