'use client';

import { ReactNode, useEffect, useState } from 'react';
import { SocketProvider } from '@tapestry/socket';
import { tokenStore } from '@/lib/api';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN || '';
const IS_DEV = process.env.NODE_ENV === 'development';

export function SocketProviderWrapper({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>(() => tokenStore.get() || '');

  useEffect(() => {
    // Initial token sync
    const currentToken = tokenStore.get();
    if (currentToken !== token) {
      setToken(currentToken || '');
    }

    // Listen for storage events (cross-tab token changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tapestry_token') {
        setToken(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token]);

  // Don't connect socket if no token
  if (!token) {
    return <>{children}</>;
  }

  return (
    <SocketProvider apiOrigin={API_ORIGIN} token={token} debug={IS_DEV}>
      {children}
    </SocketProvider>
  );
}
