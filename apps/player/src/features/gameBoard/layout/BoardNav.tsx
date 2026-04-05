'use client';

import type { BoardZone } from '../useGameBoard';
import styles from './BoardNav.module.scss';

type NavItem = {
  key: BoardZone;
  label: string;
  icon: string;
  swOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { key: 'feed', label: 'Feed', icon: '📋' },
  { key: 'encounters', label: 'Encounters', icon: '⚔️' },
  { key: 'notes', label: 'Notes', icon: '📝' },
  { key: 'rolls', label: 'Rolls', icon: '🎲' },
  { key: 'party', label: 'Party', icon: '👥' },
  { key: 'character', label: 'Character', icon: '🧙' },
];

type Props = {
  activeZone: BoardZone;
  onZoneChange: (zone: BoardZone) => void;
  isSW: boolean;
};

export default function BoardNav({ activeZone, onZoneChange, isSW }: Props) {
  const items = isSW ? NAV_ITEMS : NAV_ITEMS.filter((item) => !item.swOnly);

  return (
    <div className={styles.nav}>
      {items.map((item) => (
        <button
          key={item.key}
          className={`${styles.item} ${activeZone === item.key ? styles.active : ''}`}
          onClick={() => onZoneChange(item.key)}
          title={item.label}
          aria-label={item.label}
          aria-current={activeZone === item.key ? 'page' : undefined}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
