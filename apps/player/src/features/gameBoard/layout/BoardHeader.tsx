'use client';

import Link from 'next/link';
import type { CampaignType } from '@tapestry/types';
import { Avatar, Button } from '@tapestry/ui';
import { useGameBoardPresence } from '../useGameBoardPresence';
import styles from './BoardHeader.module.scss';

type Props = {
  campaign: CampaignType;
  campaignId: string;
  isSW: boolean;
};

export default function BoardHeader({ campaign, campaignId, isSW }: Props) {
  const { isUserOnline, currentUserCount } = useGameBoardPresence(campaignId);

  // Sort members: online first, then rest
  const sortedMembers = [...campaign.members].sort((a, b) => {
    const aPlayer = typeof a.player === 'object' ? a.player : null;
    const bPlayer = typeof b.player === 'object' ? b.player : null;
    const aOnline = aPlayer?._id ? isUserOnline(aPlayer._id) : false;
    const bOnline = bPlayer?._id ? isUserOnline(bPlayer._id) : false;

    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  const visibleMembers = sortedMembers.slice(0, 5);
  const overflow = campaign.members.length - visibleMembers.length;
  const hasLiveUsers = currentUserCount > 0;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href={`/games/${campaignId}`} className={styles.backLink}>
          ←
        </Link>
        <h1 className={styles.name}>{campaign.name}</h1>
        {campaign.status === 'archived' && <span className={styles.badge}>Archived</span>}
        {hasLiveUsers && <span className={styles.liveBadge}>● Live ({currentUserCount})</span>}
      </div>

      <div className={styles.right}>
        <div className={styles.members}>
          {visibleMembers.map((m, i) => {
            const player = typeof m.player === 'object' ? m.player : null;
            const online = player?._id ? isUserOnline(player._id) : false;
            return (
              <div className={styles.memberAvatar} key={player?._id ?? i}>
                <Avatar src={player?.avatar ?? undefined} alt={player?.displayName ?? 'Member'} name={player?.displayName ?? undefined} size="sm" />
                {online && <span className={styles.onlineDot} />}
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
