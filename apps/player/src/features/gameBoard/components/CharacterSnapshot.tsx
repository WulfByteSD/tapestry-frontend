'use client';

import { Avatar, Button } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import styles from './CharacterSnapshot.module.scss';

interface Props {
  activeCharacter: CharacterSheet | null;
  playerName: string;
  isLoading?: boolean;
  onClick?: () => void;
}

function Pips({ current, max, temp = 0 }: { current: number; max: number; temp?: number }) {
  return (
    <div className={styles.pips}>
      {Array.from({ length: max }).map((_, i) => {
        const isTemp = i >= current && i < current + temp;
        const isFilled = i < current;
        return <span key={i} className={[styles.pip, isFilled ? styles.filled : '', isTemp ? styles.temp : ''].filter(Boolean).join(' ')} />;
      })}
    </div>
  );
}

/**
 * Displays the currently active character in compact sidebar format.
 * Shows "Acting as [Player]" when no character is selected.
 */
export default function CharacterSnapshot({ activeCharacter, playerName, isLoading, onClick }: Props) {
  if (isLoading) {
    return (
      <div className={styles.snapshot}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
            <div className={styles.skeletonLine} style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    );
  }

  // No character selected - "As Self" mode
  if (!activeCharacter) {
    return (
      <button className={styles.snapshot} onClick={onClick} type="button">
        <div className={styles.avatarWrapper}>
          <Avatar name={playerName} size="md" />
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{playerName}</p>
          <p className={styles.meta}>Acting as self</p>
        </div>
        <div className={styles.chevron}>›</div>
      </button>
    );
  }

  // Character selected
  const { name, avatarUrl, sheet } = activeCharacter;
  const archetype = sheet.archetypeKey ?? 'Unknown';
  const weaveLevel = sheet.weaveLevel ?? 1;
  const hp = sheet.resources.hp;
  const threads = sheet.resources.threads;

  return (
    <button className={styles.snapshot} onClick={onClick} type="button">
      <div className={styles.avatarWrapper}>
        <Avatar src={avatarUrl ?? undefined} alt={name} size="md" />
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        <p className={styles.meta}>
          {archetype} · Lvl {weaveLevel}
        </p>
        <div className={styles.resources}>
          <div className={styles.resourceRow}>
            <span className={styles.resourceLabel}>HP</span>
            <Pips current={hp.current} max={hp.max} temp={hp.temp} />
          </div>
          <div className={styles.resourceRow}>
            <span className={styles.resourceLabel}>Threads</span>
            <Pips current={threads.current} max={threads.max} />
          </div>
        </div>
      </div>
      <div className={styles.chevron}>›</div>
    </button>
  );
}
