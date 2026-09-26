'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardBody, CardHeader, TextField } from '@tapestry/ui';
import { useForgotPassword } from '@/lib/auth-hooks';
import styles from './ForgotPassword.module.scss';

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ForgotPasswordView() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [didSubmit, setDidSubmit] = useState(false);

  const normalizedEmail = email.trim();
  const emailError = didSubmit && !normalizedEmail ? 'Email is required' : didSubmit && !isValidEmail(normalizedEmail) ? 'Please enter a valid email address' : undefined;

  const canSubmit = isValidEmail(normalizedEmail) && !forgotPassword.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDidSubmit(true);

    if (!canSubmit) {
      return;
    }

    forgotPassword.mutate(normalizedEmail.toLowerCase());
  };

  if (forgotPassword.isSuccess) {
    return (
      <div className={styles.wrap}>
        <Card className={styles.card} padding="lg">
          <CardHeader className={styles.header}>
            <h1 className={styles.title}>Check your email</h1>
          </CardHeader>
          <CardBody>
            <div className={styles.success}>
              <p className={styles.successTitle}>Reset link sent</p>
              <p className={styles.successMessage}>
                If an account with that email exists, we&apos;ve sent instructions on how to reset your password. Check your inbox and follow the link in the email.
              </p>
            </div>
            <div className={styles.links}>
              <Link href="/login" className={styles.link}>
                Back to login
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Card className={styles.card} padding="lg">
        <CardHeader className={styles.header}>
          <h1 className={styles.title}>Forgot password</h1>
          <p className={styles.subtitle}>Enter your email and we&apos;ll send you a link to reset your password.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <TextField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} autoComplete="email" autoFocus />
            <Button type="submit" tone="gold" disabled={forgotPassword.isPending} fullWidth>
              {forgotPassword.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
          <div className={styles.links}>
            <Link href="/login" className={styles.link}>
              Back to login
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
