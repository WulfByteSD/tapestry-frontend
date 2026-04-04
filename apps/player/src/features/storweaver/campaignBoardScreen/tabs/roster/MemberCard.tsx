'use client';

import { useState } from 'react';
import type { CampaignMember } from '@tapestry/types';
import { Avatar, DropdownMenu, useAlert } from '@tapestry/ui';
import type { DropdownMenuItem } from '@tapestry/ui';
import { FaEllipsisV, FaEdit, FaPencilAlt, FaTrash, FaCrown, FaArchive } from 'react-icons/fa';
import {
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
  useUpdateMemberNicknameMutation,
  useTransferOwnershipMutation,
  useArchiveMemberMutation,
} from '@/lib/campaign-hooks';
import { ChangeRoleModal } from './ChangeRoleModal.component';
import { EditNicknameModal } from './EditNicknameModal.component';
import styles from './RosterTab.module.scss';

type Props = {
  member: CampaignMember;
  isArchived: boolean;
  campaignId: string;
  currentUserRole: 'sw' | 'co-sw' | 'player' | 'observer';
  currentUserId: string;
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

export function MemberCard({ member, isArchived, campaignId, currentUserRole, currentUserId }: Props) {
  const { addAlert } = useAlert();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);

  const removeMutation = useRemoveMemberMutation(campaignId);
  const updateRoleMutation = useUpdateMemberRoleMutation(campaignId);
  const updateNicknameMutation = useUpdateMemberNicknameMutation(campaignId);
  const transferOwnershipMutation = useTransferOwnershipMutation(campaignId);
  const archiveMutation = useArchiveMemberMutation(campaignId);

  const isOwnCard = member.player?._id === currentUserId;
  const canManage = (currentUserRole === 'sw' || currentUserRole === 'co-sw') && !isOwnCard;
  const isSW = currentUserRole === 'sw';
  const targetIsSW = member.role === 'sw';

  const handleRoleChange = (newRole: 'sw' | 'co-sw' | 'player' | 'observer') => {
    const playerId = member.player?._id;
    if (!playerId) return;

    // If changing to SW, use transfer ownership endpoint
    if (newRole === 'sw' && isSW) {
      transferOwnershipMutation.mutate(
        { newOwnerId: playerId },
        {
          onSuccess: () => {
            setRoleModalOpen(false);
          },
        }
      );
    } else {
      updateRoleMutation.mutate(
        { playerId, role: newRole },
        {
          onSuccess: () => {
            setRoleModalOpen(false);
          },
          onError: (error: any) => {
            const messageTxt = error.response && error.response.data.message ? error.response.data.message : error.message;
            addAlert({ type: 'error', message: `Failed to update role: ${messageTxt}` });
          },
        }
      );
    }
  };

  const handleNicknameChange = (newNickname: string) => {
    const playerId = member.player?._id;
    if (!playerId) return;

    updateNicknameMutation.mutate(
      { playerId, nickname: newNickname },
      {
        onSuccess: () => {
          setNicknameModalOpen(false);
        },
      }
    );
  };

  const handleRemove = () => {
    const playerId = member.player?._id;
    if (!playerId) return;

    // Show confirmation before removing
    if (confirm(`Are you sure you want to remove ${member.nickname || member.player?.displayName} from the campaign?`)) {
      removeMutation.mutate({ playerId });
    }
  };

  const handleArchive = () => {
    const playerId = member.player?._id;
    if (!playerId) return;

    // Show confirmation before archiving
    if (confirm(`Are you sure you want to archive ${member.nickname || member.player?.displayName}?`)) {
      archiveMutation.mutate({ playerId });
    }
  };

  // Build menu items based on permissions
  const menuItems: DropdownMenuItem[] = [];

  if (canManage) {
    // Change Role (only if not targeting the primary SW)
    if (!targetIsSW) {
      menuItems.push({
        label: 'Change Role',
        icon: <FaEdit />,
        onClick: () => setRoleModalOpen(true),
      });
    }

    // Transfer Ownership (only if current user is SW and target is not already SW)
    if (isSW && !targetIsSW) {
      menuItems.push({
        label: 'Transfer Ownership',
        icon: <FaCrown />,
        onClick: () => setRoleModalOpen(true), // Opens role modal with SW option
      });
    }

    // Edit Nickname
    menuItems.push({
      label: 'Edit Nickname',
      icon: <FaPencilAlt />,
      onClick: () => setNicknameModalOpen(true),
    });

    // Divider before destructive actions
    menuItems.push({ divider: true });

    // Archive
    menuItems.push({
      label: 'Archive',
      icon: <FaArchive />,
      onClick: handleArchive,
      variant: 'danger',
    });

    // Remove (only if not the primary SW)
    if (!targetIsSW) {
      menuItems.push({
        label: 'Remove',
        icon: <FaTrash />,
        onClick: handleRemove,
        variant: 'danger',
      });
    }
  }

  return (
    <>
      <div className={styles.memberCard}>
        <div className={styles.memberInfo}>
          <Avatar src={member.player?.avatar} name={member.nickname || member.player?.displayName} size="md" />
          <div className={styles.memberDetails}>
            <div className={styles.memberName}>{member.nickname || member.player?.displayName || 'Unknown'}</div>
            <div className={styles.memberMeta}>
              <span className={getRoleBadgeClass(member.role)}>{getRoleLabel(member.role)}</span>
              <span className={styles.joinDate}>Joined {formatDate(member.joinedAt)}</span>
            </div>
          </div>
        </div>
        {!isArchived && canManage && menuItems.length > 0 && (
          <DropdownMenu
            items={menuItems}
            trigger={
              <button className={styles.actionButton} title="Member actions">
                <FaEllipsisV />
              </button>
            }
            openOn="click"
            closeOnSelect={true}
            align="right"
            position="bottom"
          />
        )}
      </div>

      {/* Modals */}
      <ChangeRoleModal
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        onConfirm={handleRoleChange}
        currentRole={member.role}
        memberName={member.nickname || member.player?.displayName || 'Unknown'}
        loading={updateRoleMutation.isPending || transferOwnershipMutation.isPending}
      />

      <EditNicknameModal
        open={nicknameModalOpen}
        onCancel={() => setNicknameModalOpen(false)}
        onConfirm={handleNicknameChange}
        currentNickname={member.nickname || member.player?.displayName || ''}
        memberName={member.player?.displayName || 'Unknown'}
        loading={updateNicknameMutation.isPending}
      />
    </>
  );
}
