'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@tapestry/ui';
import type { AuthRedirectGateProps } from './AuthRedirectGate.types';
import styles from './AuthRedirectGate.module.scss';
import { alertManager } from '@tapestry/ui';

// ─── Inner component — uses useSearchParams(), requires Suspense boundary ───

function AuthRedirectGateInner({ authUrl, onTokenReceived, redirectTo = '/', serviceName, logo }: AuthRedirectGateProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginHref, setLoginHref] = useState<string>('#');

  // Build the redirect-back URL on the client (window.location.origin not available on server)
  useEffect(() => {
    const redirectBack = `${window.location.origin}/login`;
    setLoginHref(`${authUrl}?redirect=${encodeURIComponent(redirectBack)}`);
  }, [authUrl]);

  // Handle ?token= param from the auth portal redirect
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token || status !== 'idle') return;

    setStatus('processing');

    onTokenReceived(token)
      .then(() => {
        // Clean token from URL before navigating away
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.pathname + url.search);
        router.replace(redirectTo);
      })
      .catch((err: unknown) => {
        alertManager.addAlert({
          type: 'error',
          message: 'Authentication failed',
          description: err instanceof Error ? err.message : undefined,
          showIcon: true,
        });
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
        setStatus('error');
      });
  }, [searchParams, status, onTokenReceived, redirectTo, router]);

  if (status === 'processing') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <span className={styles.spinner} aria-hidden="true" />
          <p className={styles.processingText}>Authenticating…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p className={styles.errorText}>{errorMessage}</p>
          <Button
            tone="neutral"
            variant="outline"
            onClick={() => {
              setStatus('idle');
              setErrorMessage(null);
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {logo && <div className={styles.logo}>{logo}</div>}

        <div className={styles.heading}>
          <h1 className={styles.title}>Welcome{serviceName ? ` to ${serviceName}` : ''}</h1>
          <p className={styles.subtitle}>Click the button below to sign in with your account.</p>
        </div>

        <a href={loginHref === '#' ? undefined : loginHref} className={styles.loginLink}>
          <Button tone="gold" fullWidth>
            Login
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─── Outer component — wraps inner in Suspense for useSearchParams ───────────

export default function AuthRedirectGate(props: AuthRedirectGateProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <span className={styles.spinner} aria-hidden="true" />
          </div>
        </div>
      }
    >
      <AuthRedirectGateInner {...props} />
    </Suspense>
  );
}
