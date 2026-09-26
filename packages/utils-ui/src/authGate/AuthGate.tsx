'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@tapestry/hooks';
import type { AuthGateProps } from './AuthGate.types';

export default function AuthGate({ children, redirectTo = '/login', loadingFallback = null }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { useMe } = useAuthContext();
  const { data: user, isLoading, isError } = useMe();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;
    if (!user || isError) {
      const next = encodeURIComponent(pathname ?? '/');
      router.replace(`${redirectTo}?next=${next}`);
    }
  }, [mounted, isLoading, user, isError, router, pathname, redirectTo]);

  if (!mounted || isLoading) return <>{loadingFallback}</>;
  if (!user || isError) return <>{loadingFallback}</>;

  return <>{children}</>;
}
