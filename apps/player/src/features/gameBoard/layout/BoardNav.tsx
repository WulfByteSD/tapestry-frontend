'use client';

import { Tooltip } from '@tapestry/ui';
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
  { key: 'overview', label: 'Overview', icon: '📊', swOnly: true },
  { key: 'roster', label: 'Roster', icon: '📜' },
  { key: 'requests', label: 'Requests', icon: '📥', swOnly: true },
  { key: 'invites', label: 'Invites', icon: '🔗', swOnly: true },
  { key: 'settings', label: 'Settings', icon: '⚙️', swOnly: true },
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
        <Tooltip key={item.key} title={item.label} placement="right">
          <button
            className={`${styles.item} ${activeZone === item.key ? styles.active : ''}`}
            onClick={() => onZoneChange(item.key)}
            aria-label={item.label}
            aria-current={activeZone === item.key ? 'page' : undefined}
          >
            <span className={styles.icon}>{item.icon}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
