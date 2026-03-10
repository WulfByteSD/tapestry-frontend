"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Login.module.scss";
import { useLogin } from "@/lib/auth-hooks";
import { getLoginErrorMessage, isValidEmail } from "./functions";
import { Button, Card, CardBody, CardHeader, Form, FormField, TextField, useForm } from "@tapestry/ui";

export default function LoginView() {
  const login = useLogin();
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validators: {
      email: (value) => {
        if (!value) return "Email is required";
        if (!isValidEmail(value)) return "Please enter a valid email address";
        return undefined;
      },
      password: (value) => {
        if (!value) return "Password is required";
        return undefined;
      },
    },
    onSubmit: (values) => {
      login.mutate(values);
    },
  });

  const isBusy = login.isPending;

  const emailOk = isValidEmail(form.values.email);
  const canSubmit = emailOk && form.values.password.length >= 1 && !isBusy;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    login.mutate({ email: form.values.email, password: form.values.password });
  };

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} padding="lg">
        <CardHeader>
          <div className={styles.logoContainer}>
            <Image
              src={
                "https://res.cloudinary.com/dmc7wmarf/image/upload/v1771775270/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_bcpc4f.png"
              }
              alt="Tapestry Logo"
              width={360}
              height={360}
              className={styles.logo}
            />
          </div>
          <h1 className={styles.title}>Welcome back</h1>
        </CardHeader>
        <CardBody>
          <Form form={form} className={styles.form}>
            <FormField name="email">
              {(field) => (
                <TextField
                  id="email"
                  label="Email"
                  floatingLabel
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={field.shouldShowError ? field.error : undefined}
                />
              )}
            </FormField>
            <FormField name="password">
              {(field) => (
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  floatingLabel
                  value={field.value as string}
                  onChange={(e) => field.onChange(e.target.value)}
                  error={field.shouldShowError ? field.error : undefined}
                  showPasswordToggle
                />
              )}
            </FormField>
            <Button className={styles.primaryBtn} type="submit" disabled={!canSubmit}>
              {isBusy ? "Signing in…" : "Sign in"}
            </Button>
          </Form>

          <div className={styles.links}>
            <hr className={styles.divider} />
            <Link href="/forgot-password" className={styles.link}>
              Forgot your password?
            </Link>
            <Link href="/register" className={styles.link}>
              New here? Create an account
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
