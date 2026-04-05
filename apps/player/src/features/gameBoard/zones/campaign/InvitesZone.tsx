'use client';

import type { CampaignType } from '@tapestry/types';
import styles from './InvitesZone.module.scss';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';
import { Button } from '@tapestry/ui';

type Props = {
  campaign: CampaignType & { _id: string };
  isSW: boolean;
  isArchived: boolean;
};

function formatDate(date?: Date | string): string {
  if (!date) return 'No expiration';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRoleBadgeClass(role?: string): string {
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

function getRoleLabel(role?: string): string {
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
      return 'Member';
  }
}

export default function InvitesZone({ campaign, isSW, isArchived }: Props) {
  const invites = campaign.invites || [];
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Only SW/Co-SW can view invites
  if (!isSW) {
    return (
      <div className={styles.permissionMessage}>
        <p>Only Storyweavers can view campaign invites.</p>
      </div>
    );
  }

  const handleCopy = async (code: string) => {
    const inviteUrl = `${window.location.origin}/join/${code}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (invites.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No active invites</h3>
        <p>Create invite codes to let players join this campaign.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <strong>{invites.length}</strong> {invites.length === 1 ? 'invite' : 'invites'}
      </div>

      <div className={styles.list}>
        {invites.map((invite, idx) => {
          const isCopied = copiedCode === invite.code;
          return (
            <div key={`${invite.code}-${idx}`} className={`${styles.inviteCard} ${isArchived ? styles.disabled : ''}`}>
              <div className={styles.inviteInfo}>
                <div className={styles.inviteCode}>{invite.code}</div>
                <div className={styles.inviteMeta}>
                  <span className={getRoleBadgeClass(invite.role)}>{getRoleLabel(invite.role)}</span>
                  {invite.expiresAt && <span className={styles.metaItem}>Expires {formatDate(invite.expiresAt)}</span>}
                  {typeof invite.usesRemaining === 'number' && (
                    <span className={styles.metaItem}>
                      {invite.usesRemaining} {invite.usesRemaining === 1 ? 'use' : 'uses'} left
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(invite.code)}
                className={styles.copyButton}
                disabled={isArchived}
              >
                {isCopied ? (
                  <>
                    <FaCheck /> Copied
                  </>
                ) : (
                  <>
                    <FaCopy /> Copy Link
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
