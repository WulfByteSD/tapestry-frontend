'use client';

import type { JoinRequest, PlayerType } from '@tapestry/types';
import { Avatar } from '@tapestry/ui';
import styles from '../RequestsZone.module.scss';

// Type for join request with potentially populated player
type PopulatedJoinRequest = Omit<JoinRequest, 'player'> & {
  player?: PlayerType | string;
};

type Props = {
  request: PopulatedJoinRequest;
  onReview: () => void;
  isArchived: boolean;
};

function formatDate(date?: Date | string): string {
  if (!date) return 'Unknown';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'sw':
    case 'co-sw':
      return styles.badgeSW;
    case 'player':
      return styles.badgePlayer;
    case 'observer':
      return styles.badgeObserver;
    default:
      return styles.badge;
  }
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'sw':
      return 'Storyweaver';
    case 'co-sw':
      return 'Co-Storyweaver';
    case 'player':
      return 'Player';
    case 'observer':
      return 'Observer';
    default:
      return role;
  }
}

export function RequestCard({ request, onReview, isArchived }: Props) {
  const player = typeof request.player === 'object' ? request.player : undefined;
  const playerName = player?.displayName || 'Unknown Player';
  const playerInitial = playerName.charAt(0).toUpperCase();

  return (
    <div className={`${styles.requestCard} ${isArchived ? styles.disabled : ''}`} onClick={() => !isArchived && onReview()}>
      <div className={styles.requestInfo}>
        {player?.avatar ? (
          <Avatar src={player.avatar} alt={playerName} size={'lg'} className={styles.requestAvatar} />
        ) : (
          <div className={styles.requestAvatar}>{playerInitial}</div>
        )}

        <div className={styles.requestDetails}>
          <div className={styles.requestName}>{playerName}</div>
          <div className={styles.requestMeta}>
            <span className={getRoleBadgeClass(request.preferredRole)}>{getRoleLabel(request.preferredRole)}</span>
            <span className={styles.requestDate}>{formatDate(request.createdAt)}</span>
          </div>
          {request.message && <div className={styles.messagePreview}>"{request.message}"</div>}
        </div>
      </div>

      {!isArchived && (
        <button
          className={styles.reviewButton}
          onClick={(e) => {
            e.stopPropagation();
            onReview();
          }}
        >
          Review
        </button>
      )}
    </div>
  );
}
