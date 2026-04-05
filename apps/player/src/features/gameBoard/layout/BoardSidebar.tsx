'use client';

import type { CampaignType } from '@tapestry/types';
import { Avatar } from '@tapestry/ui';
import styles from './BoardSidebar.module.scss';

type Props = {
  campaign: CampaignType;
  isSW: boolean;
};

export default function BoardSidebar({ campaign, isSW }: Props) {
  const members = campaign.members.slice(0, 8);

  return (
    <div className={styles.sidebar}>
      {/* Character Snapshot panel — stub */}
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Your Character</h3>
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
            <div className={styles.skeletonLine} style={{ width: '50%' }} />
          </div>
        </div>
        <p className={styles.placeholder}>Character snapshot coming soon</p>
      </section>

      {/* Party Members panel */}
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Party ({campaign.members.length})</h3>
        <div className={styles.memberList}>
          {members.map((m, i) => {
            const player = typeof m.player === 'object' ? m.player : null;
            return (
              <div className={styles.memberRow} key={player?._id ?? i}>
                <Avatar src={player?.avatar ?? undefined} alt={player?.displayName ?? 'Member'} name={player?.displayName ?? undefined} size="sm" />
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{player?.displayName ?? 'Unknown'}</span>
                  <span className={styles.memberRole}>{m.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions panel — stub */}
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Quick Actions</h3>
        <div className={styles.actionStubs}>
          <div className={styles.actionStub}>🎲 Roll Dice</div>
          {isSW && <div className={styles.actionStub}>⚔️ Start Encounter</div>}
          <div className={styles.actionStub}>📝 Quick Note</div>
        </div>
      </section>
    </div>
  );
}
