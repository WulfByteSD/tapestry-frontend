import { ReactNode } from 'react';

export type AuthGateProps = {
  children: ReactNode;
  redirectTo?: string;
  loadingFallback?: ReactNode;
};
