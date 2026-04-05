'use client';

import { Button } from '@tapestry/ui';
import type { CharacterRequest, CharacterSheet, PlayerType } from '@tapestry/types';
import styles from './character.module.scss';

interface Props {
  request: CharacterRequest;
  /** If true, show approve/reject (SW view). Otherwise show cancel (player view). */
  isSW: boolean;
  onCancel?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isPending?: boolean;
}

export default function PendingRequestRow({
  request,
  isSW,
  onCancel,
  onApprove,
  onReject,
  isPending,
}: Props) {
  const character = request.character as CharacterSheet;
  const player = request.player as PlayerType;
  const charName = typeof request.character === 'string' ? request.character : character.name;
  const archetype =
    typeof request.character === 'string' ? '' : (character.sheet.archetypeKey ?? 'Unknown Archetype');
  const playerName =
    typeof request.player === 'string' ? request.player : (player.displayName ?? 'Unknown Player');

  return (
    <div className={styles.pendingRow}>
      <div className={styles.pendingInfo}>
        <p className={styles.pendingName}>{charName}</p>
        <p className={styles.pendingMeta}>
          {archetype}
          {isSW && ` · ${playerName}`}
        </p>
      </div>
      <span className={styles.pendingBadge}>Pending</span>
      <div className={styles.pendingActions}>
        {isSW ? (
          <>
            <Button size="sm" variant="solid" tone="gold" onClick={onApprove} disabled={isPending}>
              Approve
            </Button>
            <Button size="sm" variant="ghost" tone="danger" onClick={onReject} disabled={isPending}>
              Reject
            </Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" tone="neutral" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
