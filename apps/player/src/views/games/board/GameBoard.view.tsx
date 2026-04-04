'use client';

import Link from 'next/link';
import { useCampaign } from '@/lib/campaign-hooks';
import { Button } from '@tapestry/ui';
import type { CampaignType } from '@tapestry/types';
import styles from './GameBoard.module.scss';

type Props = {
  campaignId: string;
};

export default function GameBoardView({ campaignId }: Props) {
  const { data: campaignResponse, isLoading, isError } = useCampaign(campaignId);

  // Extract campaign from API response
  const campaign = campaignResponse?.payload as CampaignType | undefined;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Campaign Not Found</h1>
          <p>The campaign you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/games">
            <Button variant="outline" tone="gold">
              Browse Campaigns
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href={`/games/${campaignId}`} className={styles.backLink}>
            ← Campaign Overview
          </Link>
        </div>
        <h1 className={styles.campaignName}>{campaign.name}</h1>
        {campaign.settingKey && <p className={styles.setting}>{campaign.settingKey.replace(/-/g, ' ')}</p>}
      </header>

      <main className={styles.main}>
        <div className={styles.placeholder}>
          <div className={styles.placeholderIcon}>⚔️</div>
          <h2>Game Board Coming Soon</h2>
          <p>This is where the adventure will unfold. The game board will include campaign updates, character actions, encounters, and interactive gameplay features.</p>
          <div className={styles.futureFeatures}>
            <h3>Planned Features</h3>
            <ul>
              <li>Campaign activity feed</li>
              <li>Character action submissions</li>
              <li>Encounter management</li>
              <li>Shared notes and lore</li>
              <li>Roll history</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
