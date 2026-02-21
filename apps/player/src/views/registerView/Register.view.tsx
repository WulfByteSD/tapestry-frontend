"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/lib/auth-hooks";
import styles from "./Register.module.scss";
import { getRegisterErrorMessage, isValidEmail, isValidPhone } from "./functions";

export default function RegisterView() {
  const reg = useRegister();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);

  const busy = reg.isPending;

  const emailOk = isValidEmail(email);
  const phoneOk = isValidPhone(phoneNumber);
  const passOk = password.length >= 10;
  const matchOk = password === confirm;

  const canSubmit = firstName.trim().length > 0 && emailOk && phoneOk && passOk && matchOk && !busy;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join the weave. Build your first character.</p>
        </header>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;

            reg.mutate({
              firstName: firstName.trim(),
              lastName: lastName.trim() || undefined,
              email: email.trim().toLowerCase(),
              phoneNumber: phoneNumber.trim(),
              password,
              roles: ["player"],
            });
          }}
        >
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
              disabled={busy}
            />
            {!emailOk && email.length > 0 && <div className={styles.hint}>Enter a valid email.</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              className={styles.input}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
              disabled={busy}
              placeholder="(555) 555-5555"
            />
            {!phoneOk && phoneNumber.length > 0 && <div className={styles.hint}>Enter a valid phone number.</div>}
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
                autoComplete="new-password"
                disabled={busy}
              />

              <button type="button" className={styles.ghostBtn} onClick={() => setShowPass((v) => !v)} disabled={busy}>
                {showPass ? "Hide" : "Show"}
              </button>
            </div>

            {!passOk && password.length > 0 && (
              <div className={styles.hint}>Password must be at least 10 characters.</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              className={styles.input}
              type={showPass ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={busy}
            />
            {!matchOk && confirm.length > 0 && <div className={styles.hint}>Passwords don’t match.</div>}
          </div>

          {reg.isError && (
            <div className={styles.errorBox} role="alert">
              {getRegisterErrorMessage(reg.error)}
            </div>
          )}

          <button className={styles.primaryBtn} type="submit" disabled={!canSubmit}>
            {busy ? "Creating…" : "Create account"}
          </button>

          <div className={styles.footerText}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
