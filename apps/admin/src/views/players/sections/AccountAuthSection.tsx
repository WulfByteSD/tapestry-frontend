'use client';

import { Card, CardBody, CardHeader } from '@tapestry/ui';
import { usePlayerDetail } from '@/lib/player-admin';
import styles from '../PlayerDetailView.module.scss';

type AccountAuthSectionProps = {
  playerId: string;
};

export function AccountAuthSection({ playerId }: AccountAuthSectionProps) {
  const { data: playerData } = usePlayerDetail(playerId);
  const player = playerData?.payload;

  if (!player?.auth) return null;

  return (
    <Card className={styles.authCard}>
      <CardHeader>
        <h2>Account & Auth</h2>
      </CardHeader>
      <CardBody>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <span className={styles.label}>User ID</span>
            <code className={styles.value}>{player.auth._id}</code>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Email</span>
            <span className={styles.value}>{player.auth.email}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Email Verified</span>
            <span className={styles.value} data-verified={player.auth.isEmailVerified}>
              {player.auth.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Account Status</span>
            <span className={styles.statusBadge} data-active={player.auth.isActive}>
              {player.auth.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Customer ID</span>
            <code className={styles.value}>{player.auth.customerId}</code>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
