'use client';

import { useState, type ComponentType } from 'react';
import { Tooltip } from '@tapestry/ui';
import { TbMessages, TbNews, TbSwords, TbDice, TbNotebook, TbUsersGroup, TbUserCircle, TbListDetails, TbBook2, TbInbox, TbLink, TbSettings } from 'react-icons/tb';
import type { BoardZone } from '../useGameBoard';
import styles from './BoardNav.module.scss';

type NavItem = { key: BoardZone; label: string; icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }> };
const GROUPS: { label: string; swOnly?: boolean; items: NavItem[] }[] = [
  { label: 'Play', items: [
    { key: 'chat', label: 'Chat', icon: TbMessages },
    { key: 'feed', label: 'Feed', icon: TbNews },
    { key: 'encounters', label: 'Encounters', icon: TbSwords },
    { key: 'notes', label: 'Notes', icon: TbNotebook },
    { key: 'rolls', label: 'Rolls', icon: TbDice },
  ] },
  { label: 'Table', items: [
    { key: 'party', label: 'Party', icon: TbUsersGroup },
    { key: 'character', label: 'Character', icon: TbUserCircle },
    { key: 'roster', label: 'Roster', icon: TbListDetails },
  ] },
  { label: 'Storyweaver', swOnly: true, items: [
    { key: 'overview', label: 'Overview', icon: TbBook2 },
    { key: 'requests', label: 'Requests', icon: TbInbox },
    { key: 'invites', label: 'Invites', icon: TbLink },
    { key: 'settings', label: 'Settings', icon: TbSettings },
  ] },
];

type Props = {
  activeZone: BoardZone;
  onZoneChange: (zone: BoardZone) => void;
  isSW: boolean;
  expanded: boolean;
  mobile: boolean;
  onToggleExpanded: () => void;
};

export default function BoardNav({ activeZone, onZoneChange, isSW, expanded, mobile, onToggleExpanded }: Props) {
  const [focusedZone, setFocusedZone] = useState<BoardZone | null>(null);
  const [hoveredZone, setHoveredZone] = useState<BoardZone | null>(null);
  const showLabels = expanded || mobile;

  return (
    <div className={styles.nav} data-expanded={showLabels} data-mobile={mobile}>
      {!mobile ? (
        <button type="button" className={styles.toggle} onClick={onToggleExpanded} aria-expanded={expanded} aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'} title={expanded ? 'Collapse navigation' : 'Expand navigation'}>
          <TbListDetails size={20} aria-hidden />
          {expanded ? <span>Collapse navigation</span> : null}
        </button>
      ) : null}
      {GROUPS.filter((group) => !group.swOnly || isSW).map((group) => (
        <div className={styles.group} key={group.label} role="group" aria-label={group.label}>
          {!mobile && expanded ? <p className={styles.groupTitle}>{group.label}</p> : null}
          {group.items.map(({ key, label, icon: Icon }) => (
            <Tooltip key={key} title={!showLabels ? label : undefined} placement="right" visible={!showLabels && (focusedZone === key || hoveredZone === key)}>
              <button
                type="button"
                className={`${styles.item} ${activeZone === key ? styles.active : ''}`}
                onClick={() => onZoneChange(key)}
                onFocus={(event) => setFocusedZone(event.currentTarget.matches(':focus-visible') ? key : null)}
                onPointerEnter={() => setHoveredZone(key)}
                onPointerLeave={() => setHoveredZone(null)}
                onPointerDown={() => { setFocusedZone(null); setHoveredZone(null); }}
                onKeyDown={(event) => { if (event.key === 'Escape') { setFocusedZone(null); setHoveredZone(null); } }}
                onBlur={() => setFocusedZone(null)}
                aria-label={label}
                aria-current={activeZone === key ? 'page' : undefined}
                aria-controls="board-zone-content"
              >
                <Icon size={21} aria-hidden />
                {showLabels ? <span>{label}</span> : null}
              </button>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  );
}
