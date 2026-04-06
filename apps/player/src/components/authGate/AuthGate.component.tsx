'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMe } from '@/lib/auth-hooks';
import { Loader } from '@tapestry/ui';
import styles from './AuthGate.module.scss';

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (isLoading) return;

    // Treat "error" as unauthenticated for MVP purposes
    if (!user || isError) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`/login?next=${next}`);
    }
  }, [isLoading, user, isError, router, pathname]);

  if (isLoading)
    return (
      <div className={styles.state}>
        <Loader size="lg" tone="gold" />
      </div>
    );

  // While redirecting, render nothing (or a small message)
  if (!user || isError)
    return (
      <div className={styles.state}>
        <Loader size="lg" tone="gold" label="Redirecting…" />
      </div>
    );

  return <>{children}</>;
}
