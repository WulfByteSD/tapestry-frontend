'use client';

import React from 'react';
import { Button, Modal } from '@tapestry/ui';

interface CancelAccountModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CancelAccountModal({ open, onConfirm, onCancel, isLoading = false }: CancelAccountModalProps) {
  return (
    <Modal
      open={open}
      title="Cancel Account"
      onCancel={onCancel}
      closable={!isLoading}
      maskClosable={!isLoading}
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" tone="neutral" onClick={onCancel} disabled={isLoading}>
            Keep My Account
          </Button>
          <Button tone="danger" onClick={onConfirm} isLoading={isLoading}>
            Yes, Cancel My Account
          </Button>
        </div>
      }
      width={480}
      centered
    >
      <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Are you sure you want to cancel your account?</p>
      <p style={{ margin: '0 0 8px', fontSize: '14px' }}>
        Your account will be cancelled at the end of your current billing period. Until then, you will retain access to all features.
      </p>
      <p style={{ margin: 0, fontSize: '13px', opacity: 0.65 }}>
        Once the billing period ends, your profile will no longer be discoverable by teams and agents. Your account will not be permanently deleted.
      </p>
    </Modal>
  );
}
