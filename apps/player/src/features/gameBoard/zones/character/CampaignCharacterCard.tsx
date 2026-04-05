'use client';

import { Avatar, Button } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import styles from './character.module.scss';

interface Props {
  character: CharacterSheet;
  canDetach: boolean;
  onDetach: () => void;
  isDetaching?: boolean;
}

function Pips({ current, max, temp = 0 }: { current: number; max: number; temp?: number }) {
  return (
    <div className={styles.pips}>
      {Array.from({ length: max }).map((_, i) => {
        const isTemp = i >= current && i < current + temp;
        const isFilled = i < current;
        return (
          <span
            key={i}
            className={[
              styles.pip,
              isFilled ? styles.filled : '',
              isTemp ? styles.temp : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        );
      })}
    </div>
  );
}

export default function CampaignCharacterCard({ character, canDetach, onDetach, isDetaching }: Props) {
  const { name, avatarUrl, sheet } = character;
  const archetype = sheet.archetypeKey ?? 'Unknown Archetype';
  const weaveLevel = sheet.weaveLevel ?? 1;
  const hp = sheet.resources.hp;
  const threads = sheet.resources.threads;

  return (
    <div className={styles.card}>
      <div className={styles.cardAvatar}>
        <Avatar
          src={avatarUrl ?? undefined}
          alt={name}
          size="md"
        />
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{name}</p>
        <p className={styles.cardMeta}>
          {archetype} · Level {weaveLevel}
        </p>
        <div className={styles.cardResources}>
          <div className={styles.resourceGroup}>
            <span className={styles.resourceLabel}>HP</span>
            <Pips current={hp.current} max={hp.max} temp={hp.temp} />
          </div>
          <div className={styles.resourceGroup}>
            <span className={styles.resourceLabel}>Threads</span>
            <Pips current={threads.current} max={threads.max} />
          </div>
        </div>
      </div>
      {canDetach && (
        <div className={styles.cardActions}>
          <Button
            size="sm"
            variant="ghost"
            tone="danger"
            onClick={onDetach}
            disabled={isDetaching}
          >
            Detach
          </Button>
        </div>
      )}
    </div>
  );
}
