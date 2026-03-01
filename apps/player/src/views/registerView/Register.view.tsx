"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/lib/auth-hooks";
import styles from "./Register.module.scss";
import { getRegisterErrorMessage, isValidEmail, isValidPhone } from "./functions";
import { Button, TextField } from "@tapestry/ui";

export default function RegisterView() {
  const reg = useRegister();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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
            <TextField
              id="firstName"
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={busy}
            />

            <TextField
              id="lastName"
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={busy}
            />
          </div>

          <TextField
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            disabled={busy}
            error={!emailOk && email.length > 0 ? "Enter a valid email." : undefined}
          />

          <TextField
            id="phone"
            label="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            disabled={busy}
            placeholder="(555) 555-5555"
            error={!phoneOk && phoneNumber.length > 0 ? "Enter a valid phone number." : undefined}
          />

          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={busy}
            showPasswordToggle
            error={!passOk && password.length > 0 ? "Password must be at least 10 characters." : undefined}
          />

          <TextField
            id="confirm"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            disabled={busy}
            showPasswordToggle
            error={!matchOk && confirm.length > 0 ? "Passwords don't match." : undefined}
          />

          {reg.isError && (
            <div className={styles.errorBox} role="alert">
              {getRegisterErrorMessage(reg.error)}
            </div>
          )}

          <Button className={styles.primaryBtn} type="submit" disabled={!canSubmit}>
            {busy ? "Creating…" : "Create account"}
          </Button>

          <div className={styles.footerText}>
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
