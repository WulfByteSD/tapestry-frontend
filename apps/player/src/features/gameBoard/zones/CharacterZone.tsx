'use client';

import styles from './zones.module.scss';

export default function CharacterZone() {
  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Your Character</h2>
      </div>
      <p className={styles.zoneDescription}>Your character sheet, campaign-scoped actions, and progression will show here.</p>
      <div className={styles.skeletonCharacter}>
        <div className={styles.skeletonAvatarLg} />
        <div className={styles.skeletonBody}>
          <div className={styles.skeletonLine} style={{ width: '60%' }} />
          <div className={styles.skeletonLine} style={{ width: '40%' }} />
          <div className={styles.skeletonLine} style={{ width: '75%' }} />
        </div>
      </div>
      <div className={styles.skeletonGrid}>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '50%' }} />
          <div className={styles.skeletonBlock} />
        </div>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '65%' }} />
          <div className={styles.skeletonBlock} />
        </div>
      </div>
    </div>
  );
}
