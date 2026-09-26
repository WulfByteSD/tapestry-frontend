'use client';

import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tapestry/ui';
import { setCustomPassword } from '@tapestry/api-client';
import type { AxiosInstance } from 'axios';

export type PasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export function usePasswordForm(api: AxiosInstance, userId: string, onSuccess?: () => void) {
  const { mutateAsync: savePasswordAsync, isPending: isSaving } = useMutation({
    mutationFn: (values: PasswordFormValues) => setCustomPassword(api, userId, { password: values.newPassword }),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const form = useForm<PasswordFormValues>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validators: {
      newPassword: (v) => (!v ? 'Password is required' : v.length < 8 ? 'Password must be at least 8 characters' : undefined),
      confirmPassword: (v, values) => (!v ? 'Please confirm your password' : v !== values.newPassword ? 'Passwords do not match' : undefined),
    },
    validateOnBlur: true,
    onSubmit: async (values, formApi) => {
      await savePasswordAsync(values);
      formApi.reset();
    },
  });

  return { form, isSaving };
}
