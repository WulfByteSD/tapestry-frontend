'use client';

import { Modal } from '@tapestry/ui';

type DeleteResourceModalProps = {
  open: boolean;
  resourceLabel: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function DeleteResourceModal({ open, resourceLabel, loading, onConfirm, onClose }: DeleteResourceModalProps) {
  return (
    <Modal
      open={open}
      title="Delete Resource"
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={loading}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ tone: 'danger' }}
    >
      <p>
        Are you sure you want to delete <strong>{resourceLabel}</strong>?
      </p>
      <p>This action cannot be undone.</p>
    </Modal>
  );
}
