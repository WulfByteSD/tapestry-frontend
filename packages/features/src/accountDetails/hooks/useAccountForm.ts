'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert, useForm } from '@tapestry/ui';
import { me, updateUserAccount } from '@tapestry/api-client';
import type { AxiosInstance } from 'axios';

export type AccountFormValues = {
  email: string;
  notificationsEmail: boolean;
  notificationsSms: boolean;
  notificationsPush: boolean;
};

export function useAccountForm(api: AxiosInstance, userId: string, onSuccess?: () => void) {
  const { addAlert } = useAlert();
  const qc = useQueryClient();
  const initialized = useRef(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => me(api),
  });

  const { mutateAsync: saveAsync, isPending: isSaving } = useMutation({
    mutationFn: (values: AccountFormValues) =>
      updateUserAccount(api, userId, {
        email: values.email,
        notificationSettings: {
          email: values.notificationsEmail,
          sms: values.notificationsSms,
          push: values.notificationsPush,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      addAlert({ type: 'success', message: 'Account information updated successfully' });
      onSuccess?.();
    },
    onError: (error: any) => {
      addAlert({ type: 'error', message: `Failed to update account information. Please try again: ${error.message}` });
    },
  });

  const form = useForm<AccountFormValues>({
    initialValues: {
      email: '',
      notificationsEmail: false,
      notificationsSms: false,
      notificationsPush: false,
    },
    validators: {
      email: (v) => (!v ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : undefined),
    },
    validateOnBlur: true,
    onSubmit: async (values) => {
      await saveAsync(values);
    },
  });

  useEffect(() => {
    if (!user || initialized.current) return;
    form.replaceValues({
      email: user.email ?? '',
      notificationsEmail: Boolean(user.notificationSettings?.email),
      notificationsSms: Boolean(user.notificationSettings?.sms),
      notificationsPush: Boolean(user.notificationSettings?.push),
    });
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { form, user, isLoading, isSaving };
}
