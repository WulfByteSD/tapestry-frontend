import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forgotPassword, me, register, resetPassword, setAuthToken } from '@tapestry/api-client';
import { useAlert } from '@tapestry/ui';
import { createSessionAuth } from '@tapestry/hooks';
import { api, tokenStore } from '@/lib/api';

function useLoginErrorHandler() {
  const { addAlert } = useAlert();

  return () => {
    addAlert({
      type: 'error',
      message: 'Login failed. Please check your credentials and try again.',
    });
  };
}

const sessionAuth = createSessionAuth(api, tokenStore, {
  useOnLoginError: useLoginErrorHandler,
  loginErrorLogLabel: 'Login error:',
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
      qc.setQueryData(['me'], profile);
    },
    onError: (error) => {
      console.error('Registration error:', error);
      addAlert({ type: 'error', message: `Registration failed. Please try again. Error: ${error.message}` });
    },
  });
}

export function useForgotPassword() {
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: (email: string) => forgotPassword(api, email),
    onError: (error) => {
      console.error('Forgot password error:', error);
      addAlert({ type: 'error', message: 'Failed to send reset email. Please try again.' });
    },
  });
}

export function useResetPassword() {
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => resetPassword(api, token, newPassword),
    onError: (error) => {
      console.error('Password reset error:', error);
      addAlert({ type: 'error', message: 'Failed to reset password. Your link may be invalid or expired.' });
    },
  });
}
