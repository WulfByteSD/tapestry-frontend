"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useAuthContext } from "@tapestry/hooks";
import { AlertContainer } from "../alert";
import { Button } from "../button";
import { Card, CardBody, CardHeader } from "../card";
import { TextField } from "../input";
import styles from "./LoginScreen.module.scss";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginAuxiliaryLink = {
  href: string;
  label: string;
};

export type LoginAuthState = {
  user?: unknown | null;
  isLoading?: boolean;
  isError?: boolean;
  onAuthError?: () => void;
  onAuthenticated?: (nextTarget: string) => void;
  nextTarget?: string;
};

export type LoginScreenProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  brandBadgeText?: string;
  brandImageSrc?: string;
  brandImageAlt?: string;
  auxiliaryLinks?: LoginAuxiliaryLink[];
  LinkComponent?: React.ElementType;
  fullHeight?: boolean;
  authState?: LoginAuthState;
  showAlertContainer?: boolean;
  className?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginScreen({
  title = "Welcome back",
  subtitle,
  eyebrow,
  brandBadgeText = "TA",
  brandImageSrc,
  brandImageAlt = "Tapestry Logo",
  auxiliaryLinks = [],
  LinkComponent = "a",
  fullHeight = false,
  authState,
  showAlertContainer = true,
  className,
}: LoginScreenProps) {
  const { useLogin } = useAuthContext();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [didSubmit, setDidSubmit] = useState(false);

  const nextTarget = useMemo(() => authState?.nextTarget || "/", [authState?.nextTarget]);

  useEffect(() => {
    if (authState?.isError) {
      authState.onAuthError?.();
    }
  }, [authState?.isError, authState?.onAuthError]);

  useEffect(() => {
    if (authState?.isLoading) {
      return;
    }

    if (authState?.user) {
      authState.onAuthenticated?.(nextTarget);
    }
  }, [authState?.isLoading, authState?.onAuthenticated, authState?.user, nextTarget]);

  const normalizedEmail = email.trim();
  const emailError =
    didSubmit && !normalizedEmail
      ? "Email is required"
      : didSubmit && !isValidEmail(normalizedEmail)
        ? "Please enter a valid email address"
        : undefined;
  const passwordError = didSubmit && !password ? "Password is required" : undefined;
  const canSubmit = isValidEmail(normalizedEmail) && password.length > 0 && !login.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDidSubmit(true);

    if (!canSubmit) {
      return;
    }

    login.mutate({
      email: normalizedEmail.toLowerCase(),
      password,
    });
  };

  if (authState?.isLoading) {
    return <div className={clsx(fullHeight ? styles.loadingFull : styles.loadingCompact, className)} />;
  }

  return (
    <div className={clsx(styles.wrap, fullHeight && styles.fullHeight, className)}>
      {showAlertContainer && <AlertContainer position="top-right" />}
      <Card className={styles.card} padding="lg">
        <CardHeader className={styles.header}>
          {brandImageSrc ? (
            <div className={styles.logoContainer}>
              <img src={brandImageSrc} alt={brandImageAlt} className={styles.logo} />
            </div>
          ) : (
            <div className={styles.badge}>{brandBadgeText}</div>
          )}

          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </CardHeader>

        <CardBody>
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextField
              id="email"
              label="Email"
              floatingLabel
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={emailError}
              autoComplete="email"
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              floatingLabel
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={passwordError}
              showPasswordToggle
              autoComplete="current-password"
            />
            <Button className={styles.primaryBtn} type="submit" disabled={!canSubmit}>
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {auxiliaryLinks.length > 0 && (
            <div className={styles.links}>
              <hr className={styles.divider} />
              {auxiliaryLinks.map((link) => (
                <LinkComponent key={link.href} href={link.href} className={styles.link}>
                  {link.label}
                </LinkComponent>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
