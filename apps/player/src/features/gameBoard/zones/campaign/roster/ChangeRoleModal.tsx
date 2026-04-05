'use client';

import { useState } from 'react';
import { Modal } from '@tapestry/ui';
import styles from '../RosterZone.module.scss';

type RoleOption = 'sw' | 'co-sw' | 'player' | 'observer';

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (role: RoleOption) => void;
  currentRole: RoleOption;
  memberName: string;
  loading?: boolean;
};

export function ChangeRoleModal({ open, onCancel, onConfirm, currentRole, memberName, loading }: Props) {
  const [selectedRole, setSelectedRole] = useState<RoleOption>(currentRole);

  const handleConfirm = () => {
    onConfirm(selectedRole);
  };

  const handleCancel = () => {
    setSelectedRole(currentRole); // Reset to current role on cancel
    onCancel();
  };

  // Show warning if changing to Storyweaver
  const showTransferWarning = selectedRole === 'sw' && currentRole !== 'sw';

  return (
    <Modal
      open={open}
      title={`Change Role for ${memberName}`}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Change Role"
      cancelText="Cancel"
      confirmLoading={loading}
      width={480}
      centered
    >
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>Select a new role for this member:</p>

        <div className={styles.roleOptions}>
          <label className={styles.roleOption}>
            <input type="radio" name="role" value="sw" checked={selectedRole === 'sw'} onChange={() => setSelectedRole('sw')} />
            <div className={styles.roleInfo}>
              <span className={styles.roleLabel}>Storyweaver</span>
              <span className={styles.roleDesc}>Full campaign control and ownership</span>
            </div>
          </label>

          <label className={styles.roleOption}>
            <input type="radio" name="role" value="co-sw" checked={selectedRole === 'co-sw'} onChange={() => setSelectedRole('co-sw')} />
            <div className={styles.roleInfo}>
              <span className={styles.roleLabel}>Co-Storyweaver</span>
              <span className={styles.roleDesc}>Assist with storytelling and member management</span>
            </div>
          </label>

          <label className={styles.roleOption}>
            <input type="radio" name="role" value="player" checked={selectedRole === 'player'} onChange={() => setSelectedRole('player')} />
            <div className={styles.roleInfo}>
              <span className={styles.roleLabel}>Player</span>
              <span className={styles.roleDesc}>Active participant in the campaign</span>
            </div>
          </label>

          <label className={styles.roleOption}>
            <input type="radio" name="role" value="observer" checked={selectedRole === 'observer'} onChange={() => setSelectedRole('observer')} />
            <div className={styles.roleInfo}>
              <span className={styles.roleLabel}>Observer</span>
              <span className={styles.roleDesc}>Watch the campaign without participating</span>
            </div>
          </label>
        </div>

        {showTransferWarning && (
          <div className={styles.warningBox}>
            <strong>⚠️ Ownership Transfer</strong>
            <p>Changing this member to Storyweaver will transfer campaign ownership to them. You will become a Co-Storyweaver.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
