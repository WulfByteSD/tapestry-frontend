'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, CardBody, CardHeader, TextField } from '@tapestry/ui';
import { useResetPassword } from '@/lib/auth-hooks';
import styles from './ResetPassword.module.scss';

export default function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [didSubmit, setDidSubmit] = useState(false);

  const newPasswordError = didSubmit && !newPassword ? 'New password is required' : undefined;
  const confirmPasswordError =
    didSubmit && !confirmPassword
      ? 'Please confirm your password'
      : didSubmit && newPassword && confirmPassword && newPassword !== confirmPassword
        ? 'Passwords do not match'
        : undefined;

  const canSubmit = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword && !resetPassword.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDidSubmit(true);

    if (!canSubmit || !token) {
      return;
    }

    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          router.push('/login');
        },
      }
    );
  };

  if (!token) {
    return (
      <div className={styles.wrap}>
        <Card className={styles.card} padding="lg">
          <CardHeader className={styles.header}>
            <h1 className={styles.title}>Invalid reset link</h1>
          </CardHeader>
          <CardBody>
            <div className={styles.errorState}>
              <p className={styles.errorMessage}>This password reset link is missing or malformed. Please request a new one from the forgot password page.</p>
            </div>
            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.link}>
                Request a new reset link
              </Link>
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
          <h1 className={styles.title}>Reset password</h1>
          <p className={styles.subtitle}>Enter and confirm your new password below.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <TextField
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={newPasswordError}
              autoComplete="new-password"
              autoFocus
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              autoComplete="new-password"
            />
            <Button type="submit" tone="gold" disabled={resetPassword.isPending} fullWidth>
              {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
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
