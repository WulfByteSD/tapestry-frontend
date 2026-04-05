'use client';

import styles from './zones.module.scss';

type Props = { isSW: boolean };

export default function ActivityFeedZone({ isSW }: Props) {
  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Activity Feed</h2>
        {isSW && (
          <button className={styles.actionButton} disabled>
            + Create Post
          </button>
        )}
      </div>
      <p className={styles.zoneDescription}>Campaign updates, character actions, and story events will appear here.</p>
      <div className={styles.skeletonFeed}>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '40%' }} />
            <div className={styles.skeletonLine} style={{ width: '90%' }} />
            <div className={styles.skeletonLine} style={{ width: '65%' }} />
          </div>
        </div>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '55%' }} />
            <div className={styles.skeletonLine} style={{ width: '80%' }} />
          </div>
        </div>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '35%' }} />
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
            <div className={styles.skeletonLine} style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
