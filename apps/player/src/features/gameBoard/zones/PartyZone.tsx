'use client';

import type { CampaignType } from '@tapestry/types';
import { Avatar } from '@tapestry/ui';
import styles from './zones.module.scss';

type Props = { campaign: CampaignType };

export default function PartyZone({ campaign }: Props) {
  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Party ({campaign.members.length})</h2>
      </div>
      <p className={styles.zoneDescription}>View all campaign members, their roles, and character assignments.</p>
      <div className={styles.partyList}>
        {campaign.members.map((m, i) => {
          const player = typeof m.player === 'object' ? m.player : null;
          return (
            <div className={styles.partyMember} key={player?._id ?? i}>
              <Avatar src={player?.avatar ?? undefined} alt={player?.displayName ?? 'Member'} name={player?.displayName ?? undefined} size="md" />
              <div className={styles.partyInfo}>
                <span className={styles.partyName}>{m.nickname ?? player?.displayName ?? 'Unknown'}</span>
                <span className={styles.partyRole}>{m.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
