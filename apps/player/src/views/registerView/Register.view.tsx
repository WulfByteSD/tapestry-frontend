"use client";

import Link from "next/link";
import { useRegister } from "@/lib/auth-hooks";
import styles from "./Register.module.scss";
import { isValidEmail, isValidPhone } from "./functions";
import { Button, Form, FormField, TextField, useForm } from "@tapestry/ui";

export default function RegisterView() {
  const reg = useRegister();
  const form = useForm({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirm: "",
    },
    validators: {
      firstName: (value) => {
        return String(value).length > 0 ? undefined : "First name is required";
      },
      email: (value) => {
        if (!isValidEmail(value)) return "Please use a valid email";
        return undefined;
      },
      password: (value) => {
        if (!value) return "Password is required";
        return undefined;
      },
      confirm: (value, values) => {
        // Validator receives: (fieldValue, allFormValues)
        if (!value) return "Please confirm your password";
        if (value !== values.password) return "Passwords do not match";
        return undefined;
      },
    },
    onSubmit: (values) => {
      reg.mutate({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim() || undefined,
        email: values.email.trim().toLowerCase(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
        roles: ["player"],
      });
    },
  });

  const busy = reg.isPending;

  const emailOk = isValidEmail(form.values.email);
  const phoneOk = isValidPhone(form.values.phoneNumber);

  const canSubmit =
    form.values.firstName.trim().length > 0 &&
    emailOk &&
    phoneOk &&
    form.values.password.length > 0 &&
    form.values.confirm.length > 0 &&
    form.values.password === form.values.confirm &&
    !busy;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join the weave. Build your first character.</p>
        </header>

        <Form form={form} className={styles.form}>
          <div className={styles.row}>
            <FormField name="firstName">
              {(field) => (
                <TextField
                  id="firstName"
                  label="First name"
                  value={field.value as string}
                  onChange={field.onChange}
                  disabled={busy}
                />
              )}
            </FormField>
            <FormField name="lastName">
              {(field) => (
                <TextField
                  id="lastName"
                  label="Last name"
                  value={field.value as string}
                  onChange={field.onChange}
                  disabled={busy}
                />
              )}
            </FormField>
          </div>

          <FormField name="email">
            {(field) => (
              <TextField
                id="email"
                label="Email"
                value={field.value as string}
                onChange={field.onChange}
                inputMode="email"
                autoComplete="email"
                disabled={busy}
              />
            )}
          </FormField>

          <FormField name="phoneNumber">
            {(field) => (
              <TextField
                id="phone"
                label="Phone number"
                value={field.value as string}
                onChange={field.onChange}
                inputMode="tel"
                autoComplete="tel"
                disabled={busy}
                placeholder="(555) 555-5555"
              />
            )}
          </FormField>

          <FormField name="password">
            {(field) => (
              <TextField
                id="password"
                label="Password"
                type="password"
                value={field.value as string}
                onChange={field.onChange}
                autoComplete="new-password"
                disabled={busy}
                showPasswordToggle
              />
            )}
          </FormField>
          <FormField name="confirm">
            {(field) => (
              <TextField
                id="confirm"
                label="Confirm password"
                type="password"
                value={field.value as string}
                onChange={field.onChange}
                autoComplete="new-password"
                disabled={busy}
              />
            )}
          </FormField>

          <Button className={styles.primaryBtn} type="submit" disabled={!canSubmit}>
            {busy ? "Creating…" : "Create account"}
          </Button>

          <div className={styles.footerText}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
