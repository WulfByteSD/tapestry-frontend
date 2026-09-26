import type { ReactNode } from 'react';

export type AuthRedirectGateProps = {
  /** The base URL of the external auth portal (e.g. process.env.NEXT_PUBLIC_AUTH_URL) */
  authUrl: string;
  /**
   * Called with the raw JWT token after the auth portal redirects back.
   * Responsible for storing the token, setting the axios auth header,
   * and seeding the user query cache.
   */
  onTokenReceived: (token: string) => Promise<void>;
  /** Where to push the router after a successful token exchange. Defaults to "/" */
  redirectTo?: string;
  /** Displayed in the login panel heading, e.g. "Professional Portal" */
  serviceName?: string;
  /** Optional logo node rendered above the heading */
  logo?: ReactNode;
};
