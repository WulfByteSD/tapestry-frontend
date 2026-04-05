'use client';

import type { JoinRequest, PlayerType } from '@tapestry/types';
import { Modal, Avatar } from '@tapestry/ui';
import styles from './RequestsTab.module.scss';

// Type for join request with potentially populated player
type PopulatedJoinRequest = Omit<JoinRequest, 'player'> & {
  player?: PlayerType | string;
};

type Props = {
  open: boolean;
  onCancel: () => void;
  onApprove: () => void;
  onReject: () => void;
  request: PopulatedJoinRequest | null;
  loading?: boolean;
};

function formatDate(date?: Date | string): string {
  if (!date) return 'Unknown';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
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

function getRoleDescription(role: string): string {
  switch (role) {
    case 'sw':
      return 'Full campaign control and ownership';
    case 'co-sw':
      return 'Assist with storytelling and member management';
    case 'player':
      return 'Active participant in the campaign';
    case 'observer':
      return 'Watch the campaign without participating';
    default:
      return '';
  }
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

export function ReviewRequestModal({ open, onCancel, onApprove, onReject, request, loading }: Props) {
  if (!request) return null;

  const player = typeof request.player === 'object' ? request.player : undefined;
  const playerName = player?.displayName || 'Unknown Player';
  const playerInitial = playerName.charAt(0).toUpperCase();

  return (
    <Modal
      open={open}
      title="Review Join Request"
      onCancel={onCancel}
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onReject}
            disabled={loading}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              background: 'rgba(255, 80, 80, 0.15)',
              border: '1px solid rgba(255, 80, 80, 0.3)',
              color: 'rgb(255, 120, 120)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 120ms ease',
            }}
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={loading}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '6px',
              background: 'rgba(92, 196, 255, 0.2)',
              border: '1px solid rgba(92, 196, 255, 0.4)',
              color: 'rgb(120, 210, 255)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 120ms ease',
            }}
          >
            {loading ? 'Processing...' : 'Approve & Add to Campaign'}
          </button>
        </div>
      }
      width={520}
      centered
      closable={!loading}
      maskClosable={!loading}
    >
      <div className={styles.modalContent}>
        {/* Player Info */}
        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Player</div>
          <div className={styles.playerInfo}>
            {player?.avatar ? (
              <Avatar src={player.avatar} alt={playerName} size={'lg'} className={styles.playerAvatar} />
            ) : (
              <div className={styles.playerAvatar}>{playerInitial}</div>
            )}
            <div className={styles.playerDetails}>
              <div className={styles.playerName}>{playerName}</div>
              <div className={styles.playerMeta}>@{player?.displayName}</div>
            </div>
          </div>
        </div>

        {/* Requested Role */}
        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Requested Role</div>
          <div className={styles.roleDisplay}>
            <span className={getRoleBadgeClass(request.preferredRole)}>{getRoleLabel(request.preferredRole)}</span>
            <div className={styles.roleInfo}>
              <span className={styles.roleDesc}>{getRoleDescription(request.preferredRole)}</span>
            </div>
          </div>
        </div>

        {/* Message (if provided) */}
        {request.message && (
          <div className={styles.modalSection}>
            <div className={styles.modalLabel}>Message to Storyweaver</div>
            <div className={styles.messageDisplay}>{request.message}</div>
          </div>
        )}

        {/* Request Date */}
        <div className={styles.modalSection}>
          <div className={styles.modalLabel}>Requested On</div>
          <div className={styles.modalValue}>{formatDate(request.createdAt)}</div>
        </div>
      </div>
    </Modal>
  );
}
