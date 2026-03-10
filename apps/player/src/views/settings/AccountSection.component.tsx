"use client";

import { useEffect } from "react";
import { Button, Form, FormField, TextField, useForm } from "@tapestry/ui";
import { useUpdateUserAccount } from "@/lib/settings-hooks";
import { isValidEmail } from "@/utils/validation";
import styles from "./AccountDetails.module.scss";

type Props = {
  userId?: string | null;
  email?: string | null;
};

type AccountFormValues = {
  email: string;
};

export default function AccountSection({ userId, email }: Props) {
  const updateAccount = useUpdateUserAccount(userId);

  const form = useForm<AccountFormValues>({
    initialValues: {
      email: "",
    },
    validators: {
      email: (value) => {
        const next = String(value).trim().toLowerCase();

        if (!next) {
          return "Email is required.";
        }

        if (!isValidEmail(next)) {
          return "Please enter a valid email address.";
        }

        return undefined;
      },
    },
    onSubmit: async (values, api) => {
      const nextEmail = values.email.trim().toLowerCase();

      await updateAccount.mutateAsync({
        email: nextEmail,
      });

      api.replaceValues({
        email: nextEmail,
      });
    },
  });

  useEffect(() => {
    form.replaceValues({
      email: email ?? "",
    });
  }, [email]);

  if (!userId) {
    return null;
  }

  return (
    <section className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className={styles.sectionSubtitle}>Update the email tied to your login.</p>
        </div>
      </div>

      <Form form={form} className={styles.formStack}>
        <FormField name="email">
          {(field) => (
            <TextField
              id={field.id}
              label="Email address"
              type="email"
              value={String(field.value ?? "")}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={field.shouldShowError ? field.error : undefined}
              disabled={updateAccount.isPending}
              autoComplete="email"
              inputMode="email"
            />
          )}
        </FormField>

        <div className={styles.actionsRow}>
          <Button type="submit" disabled={updateAccount.isPending || !form.isDirty || !form.isValid}>
            {updateAccount.isPending ? "Saving…" : "Save email"}
          </Button>
        </div>
      </Form>
    </section>
  );
}
