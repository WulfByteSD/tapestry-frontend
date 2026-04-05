'use client';

import Link from 'next/link';
import type { CampaignType } from '@tapestry/types';
import { Avatar, Button } from '@tapestry/ui';
import styles from './BoardHeader.module.scss';

type Props = {
  campaign: CampaignType;
  campaignId: string;
  isSW: boolean;
};

export default function BoardHeader({ campaign, campaignId, isSW }: Props) {
  const visibleMembers = campaign.members.slice(0, 5);
  const overflow = campaign.members.length - visibleMembers.length;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href={`/games/${campaignId}`} className={styles.backLink}>
          ←
        </Link>
        <h1 className={styles.name}>{campaign.name}</h1>
        {campaign.status === 'archived' && <span className={styles.badge}>Archived</span>}
      </div>

      <div className={styles.right}>
        <div className={styles.members}>
          {visibleMembers.map((m, i) => {
            const player = typeof m.player === 'object' ? m.player : null;
            return (
              <div className={styles.memberAvatar} key={player?._id ?? i}>
                <Avatar src={player?.avatar ?? undefined} alt={player?.displayName ?? 'Member'} name={player?.displayName ?? undefined} size="sm" />
              </div>
            );
          })}
          {overflow > 0 && <span className={styles.overflow}>+{overflow}</span>}
        </div>

        {isSW && (
          <Button variant="outline" tone="gold" size="sm" disabled>
            Post
          </Button>
        )}
      </div>
    </header>
  );
}
