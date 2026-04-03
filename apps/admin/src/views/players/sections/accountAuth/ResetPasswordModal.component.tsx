'use client';

import { Modal, Button, useAlert } from '@tapestry/ui';
import { useResetUserPassword } from '@/lib/player-admin';
import { FaExclamationTriangle } from 'react-icons/fa';
import styles from './AccountAuthSection.module.scss';

type ResetPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  authId: string;
  displayName?: string;
  email: string;
};

export function ResetPasswordModal({ open, onClose, authId, displayName, email }: ResetPasswordModalProps) {
  const { addAlert } = useAlert();
  const resetPasswordMutation = useResetUserPassword(authId);

  const handleResetPassword = () => {
    resetPasswordMutation.mutate(
      { sendNotification: true },
      {
        onSuccess: () => {
          addAlert({
            type: 'success',
            message: 'Password reset successfully! User will receive an email with their new password.',
          });
          onClose();
        },
        onError: () => {
          addAlert({
            type: 'error',
            message: 'Failed to reset password',
          });
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className={styles.modalTitle}>
          <FaExclamationTriangle style={{ color: 'var(--color-danger)' }} />
          <span>Reset User Password</span>
        </div>
      }
      footer={
        <div className={styles.modalFooter}>
          <Button variant="outline" tone="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button tone="danger" onClick={handleResetPassword} disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      }
    >
      <div className={styles.modalContent}>
        <p className={styles.confirmText}>
          Are you sure you want to reset the password for <strong>{displayName || email}</strong>?
        </p>
        <p className={styles.warningText}>A new secure password will be generated and emailed to them automatically.</p>
      </div>
    </Modal>
  );
}
