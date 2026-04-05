'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Loader, Tabs } from '@tapestry/ui';
import { usePlayerDetail } from '@/lib/player-admin';
import { createTabs, type TabKey } from './tabs';
import styles from './PlayerDetailView.module.scss';

type PlayerDetailViewProps = {
  playerId: string;
};

export default function PlayerDetailView({ playerId }: PlayerDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  const { data: playerData, isLoading: playerLoading, isError: playerError } = usePlayerDetail(playerId);

  const player = playerData?.payload;

  const tabs = useMemo(() => createTabs(playerId), [playerId]);

  if (playerLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <Loader caption="Loading player details..." />
        </div>
      </div>
    );
  }

  if (!player || playerError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <h2>Player not found</h2>
          <p>The player you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/players')}>Back to Players</Button>
        </div>
      </div>
    );
  }

  const displayName = player.displayName || player.auth?.email || 'Unknown';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>Platform Admin</p>
          <h1 className={styles.title}>{displayName}</h1>
          <p className={styles.subtitle}>Player profile and associated resources</p>
        </div>

        <div className={styles.headerActions}>
          <Button variant="outline" tone="neutral" onClick={() => router.push('/players')}>
            Back to List
          </Button>
        </div>
      </div>

      <Tabs items={tabs} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabKey)} className={styles.tabs} keepMounted={false} />
    </div>
  );
}
