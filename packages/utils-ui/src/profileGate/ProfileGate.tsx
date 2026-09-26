'use client';

import { Loader, Button } from '@tapestry/ui';
import type { ProfileGateProps } from './ProfileGate.types';
import styles from './ProfileGate.module.scss';

export default function ProfileGate({
  children,
  user,
  profileKey,
  isLoadingProfile = false,
  isErrorProfile = false,
  dashboardName,
  redirectUrl,
  redirectLabel = 'Go to correct portal',
  token,
  logo,
  loadingFallback,
}: ProfileGateProps) {
  const portalName = dashboardName ?? 'this portal';

  // ── Loading state ──────────────────────────────────────────────────────────
  // Show while user or profile data is still resolving.
  if (isLoadingProfile) {
    if (loadingFallback) return <>{loadingFallback}</>;

    return (
      <div className={styles.wrapper}>
        <Loader size="lg" tone="primary" layout="stacked" label={`Loading ${portalName}…`} />
      </div>
    );
  }

  // ── Mismatch: user has no profileRef for this dashboard ───────────────────
  // Check AFTER loading resolves so we don't flash this screen prematurely.
  const hasProfileRef = Boolean(user?.profileRefs?.[profileKey]);

  if (!hasProfileRef) {
    const redirectHref = redirectUrl ? (token ? `${redirectUrl}?token=${encodeURIComponent(token)}` : redirectUrl) : undefined;

    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {logo && <div className={styles.logo}>{logo}</div>}

          <div className={styles.heading}>
            <h2 className={styles.title}>Access Restricted</h2>
            <p className={styles.subtitle}>
              {user
                ? `Your account does not have a ${dashboardName ?? profileKey} profile registered for ${portalName}. If you believe this is an error, please contact support.`
                : `You must be signed in with a ${dashboardName ?? profileKey} account to access ${portalName}.`}
            </p>
          </div>

          {redirectHref && (
            <a href={redirectHref} className={styles.ctaLink}>
              <Button tone="gold" fullWidth>
                {redirectLabel}
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Error state (profile ref exists but fetch failed) ─────────────────────
  if (isErrorProfile) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {logo && <div className={styles.logo}>{logo}</div>}

          <div className={styles.heading}>
            <h2 className={styles.title}>Something went wrong</h2>
            <p className={styles.subtitle}>We couldn&apos;t load your {dashboardName ?? profileKey} profile. Please refresh the page or try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── All clear ─────────────────────────────────────────────────────────────
  return <>{children}</>;
}
