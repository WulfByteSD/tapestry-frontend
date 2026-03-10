"use client";

import { Button, Form, FormField, TextField, useForm } from "@tapestry/ui";
import { useRegisterContext } from "../Register.context";
import { isValidEmail } from "../functions";
import styles from "../Register.module.scss";

interface Props {
  busy?: boolean;
  onComplete: () => Promise<void> | void;
}

export default function RegisterAccountStep({ busy = false, onComplete }: Props) {
  const { values, setValues, goToStep } = useRegisterContext();

  const form = useForm({
    initialValues: {
      email: values.auth.email,
      password: values.auth.password,
      confirmPassword: values.auth.confirmPassword,
    },
    validators: {
      email: (value) =>
        isValidEmail(String(value)) ? undefined : "Please use a valid email",
      password: (value) =>
        String(value).length >= 10
          ? undefined
          : "Password must be at least 10 characters",
      confirmPassword: (value, nextValues) =>
        value === nextValues.password ? undefined : "Passwords do not match",
    },
    onSubmit: async (nextValues) => {
      setValues((prev) => ({
        ...prev,
        auth: {
          ...prev.auth,
          ...nextValues,
        },
      }));
      await onComplete();
    },
  });

  return (
    <Form form={form} className={styles.form}>
      <FormField name="email">
        {(field) => (
          <TextField
            id={field.id}
            label="Email"
            value={field.value as string}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={field.shouldShowError ? field.error : undefined}
            inputMode="email"
            autoComplete="email"
            disabled={busy}
          />
        )}
      </FormField>

      <FormField name="password">
        {(field) => (
          <TextField
            id={field.id}
            label="Password"
            type="password"
            value={field.value as string}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={field.shouldShowError ? field.error : undefined}
            autoComplete="new-password"
            disabled={busy}
            showPasswordToggle
          />
        )}
      </FormField>

      <FormField name="confirmPassword">
        {(field) => (
          <TextField
            id={field.id}
            label="Confirm password"
            type="password"
            value={field.value as string}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={field.shouldShowError ? field.error : undefined}
            autoComplete="new-password"
            disabled={busy}
          />
        )}
      </FormField>

      <div className={styles.buttonRow}>
        <Button
          className={styles.backBtn}
          type="button"
          variant="outline"
          onClick={() => goToStep("profile")}
          disabled={busy}
        >
          Back
        </Button>

        <Button className={styles.primaryBtn} type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </Button>
      </div>
    </Form>
  );
}