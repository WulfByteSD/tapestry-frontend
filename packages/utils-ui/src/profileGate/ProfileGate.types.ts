import type { ReactNode } from 'react';

export type ProfileGateProps = {
  children: ReactNode;

  /**
   * The authenticated user from useMe.
   * Must include profileRefs to determine dashboard access.
   */
  user: { profileRefs?: Record<string, string | null> } | null | undefined;

  /**
   * The key to look up in user.profileRefs.
   * e.g. "professional" | "player" | "scout" | "admin"
   * If the user has no entry (or a null value) for this key, the mismatch wall is shown.
   */
  profileKey: string;

  /**
   * isLoading from your useProfile call.
   * Gate shows a Loader while this is true.
   */
  isLoadingProfile?: boolean;

  /**
   * isError from your useProfile call.
   * Gate shows an error screen while this is true.
   */
  isErrorProfile?: boolean;

  /**
   * Human-readable name of this dashboard, used in copy.
   * e.g. "Professional Portal", "Player Portal"
   */
  dashboardName?: string;

  /**
   * URL to redirect users who don't have the correct profile.
   * If `token` is also provided it is appended as: `redirectUrl?token=<token>`
   * so the destination portal can auto-authenticate the user (SSO passthrough).
   */
  redirectUrl?: string;

  /**
   * Label for the redirect CTA button.
   * Defaults to "Go to correct portal".
   */
  redirectLabel?: string;

  /**
   * Optional JWT token appended to redirectUrl as a query param for SSO passthrough.
   * Lets the destination app authenticate the user without asking for credentials again.
   */
  token?: string;

  /** Optional logo element rendered at the top of the mismatch / error screens. */
  logo?: ReactNode;

  /** Replace the default Loader entirely when isLoadingProfile is true. */
  loadingFallback?: ReactNode;
};
