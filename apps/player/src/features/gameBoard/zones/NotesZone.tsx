'use client';

import styles from './zones.module.scss';

export default function NotesZone() {
  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Notes &amp; Lore</h2>
      </div>
      <p className={styles.zoneDescription}>Shared campaign notes, lore entries, and session summaries will live here.</p>
      <div className={styles.skeletonGrid}>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '70%' }} />
          <div className={styles.skeletonLine} style={{ width: '90%' }} />
          <div className={styles.skeletonLine} style={{ width: '50%' }} />
        </div>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '55%' }} />
          <div className={styles.skeletonLine} style={{ width: '80%' }} />
        </div>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '65%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  );
}
