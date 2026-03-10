"use client";

import { Button, Form, FormField, TextField, useForm } from "@tapestry/ui";
import { useChangePassword } from "@/lib/settings-hooks";
import styles from "./AccountDetails.module.scss";

type Props = {
  userId?: string | null;
};

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function PasswordSection({ userId }: Props) {
  const changePassword = useChangePassword(userId);

  const form = useForm<PasswordFormValues>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      currentPassword: (value) => (String(value).trim() ? undefined : "Current password is required."),
      newPassword: (value, values) => {
        const password = String(value);

        if (!password.trim()) {
          return "New password is required.";
        }

        if (password.length < 10) {
          return "New password must be at least 10 characters.";
        }

        if (password === values.currentPassword) {
          return "New password must be different from your current password.";
        }

        return undefined;
      },
      confirmPassword: (value, values) =>
        String(value) === String(values.newPassword) ? undefined : "Passwords do not match.",
    },
    onSubmit: async (values, api) => {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      api.reset();
    },
  });

  if (!userId) {
    return null;
  }

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Password</h2>
          <p className={styles.sectionSubtitle}>Update your password for signing in.</p>
        </div>
      </div>

      <Form form={form} className={styles.formStack}>
        <FormField name="currentPassword">
          {(field) => (
            <TextField
              id={field.id}
              label="Current password"
              type="password"
              value={String(field.value ?? "")}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={field.shouldShowError ? field.error : undefined}
              disabled={changePassword.isPending}
              autoComplete="current-password"
              showPasswordToggle
            />
          )}
        </FormField>

        <FormField name="newPassword">
          {(field) => (
            <TextField
              id={field.id}
              label="New password"
              type="password"
              value={String(field.value ?? "")}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={field.shouldShowError ? field.error : undefined}
              disabled={changePassword.isPending}
              autoComplete="new-password"
              showPasswordToggle
              // helperText="Use at least 10 characters."
            />
          )}
        </FormField>

        <FormField name="confirmPassword">
          {(field) => (
            <TextField
              id={field.id}
              label="Confirm new password"
              type="password"
              value={String(field.value ?? "")}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={field.shouldShowError ? field.error : undefined}
              disabled={changePassword.isPending}
              autoComplete="new-password"
              showPasswordToggle
            />
          )}
        </FormField>

        <div className={styles.actionsRow}>
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Updating…" : "Update password"}
          </Button>
        </div>
      </Form>
    </section>
  );
}
