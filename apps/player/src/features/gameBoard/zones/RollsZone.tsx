'use client';

import styles from './zones.module.scss';

export default function RollsZone() {
  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Roll History</h2>
      </div>
      <p className={styles.zoneDescription}>Dice rolls, check results, and roll history for this campaign will appear here.</p>
      <div className={styles.skeletonFeed}>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonDice}>🎲</div>
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '50%' }} />
            <div className={styles.skeletonLine} style={{ width: '30%' }} />
          </div>
        </div>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonDice}>🎲</div>
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '45%' }} />
            <div className={styles.skeletonLine} style={{ width: '35%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
