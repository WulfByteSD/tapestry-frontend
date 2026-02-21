"use client";

import { useState } from "react";
import styles from "./Login.module.scss";
import { useLogin } from "@/lib/auth-hooks";
import { getLoginErrorMessage, isValidEmail } from "./functions";

export default function LoginView() {
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const isBusy = login.isPending;

  const emailOk = isValidEmail(email);
  const canSubmit = emailOk && password.length >= 1 && !isBusy;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    login.mutate({ email, password });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Use your Tapestry account.</p>
        </header>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              disabled={isBusy}
              placeholder="you@email.com"
            />
            {!emailOk && email.length > 0 && (
              <div className={styles.hint}>Enter a valid email.</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>

            <div className={styles.passwordRow}>
              <input
                id="password"
                className={styles.input}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isBusy}
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => setShowPass((v) => !v)}
                disabled={isBusy}
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {login.isError && (
            <div className={styles.errorBox} role="alert">
              {getLoginErrorMessage(login.error)}
            </div>
          )}

          <button className={styles.primaryBtn} type="submit" disabled={!canSubmit}>
            {isBusy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}