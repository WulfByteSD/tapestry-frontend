'use client';

import styles from './zones.module.scss';

type Props = { isSW: boolean };

export default function EncounterZone({ isSW }: Props) {
  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Encounters</h2>
        {isSW && (
          <button className={styles.actionButton} disabled>
            + Start Encounter
          </button>
        )}
      </div>
      <p className={styles.zoneDescription}>Active and past encounters will be managed here. Storyweavers can create and run encounters; players respond with character actions.</p>
      <div className={styles.skeletonGrid}>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '60%' }} />
          <div className={styles.skeletonBlock} />
        </div>
        <div className={styles.skeletonTile}>
          <div className={styles.skeletonLine} style={{ width: '45%' }} />
          <div className={styles.skeletonBlock} />
        </div>
      </div>
    </div>
  );
}
