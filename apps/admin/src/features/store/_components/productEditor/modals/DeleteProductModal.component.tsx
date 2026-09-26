'use client';

import { Modal } from '@tapestry/ui';

type DeleteProductModalProps = {
  open: boolean;
  productLabel: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export default function DeleteProductModal({ open, productLabel, loading, onConfirm, onClose }: DeleteProductModalProps) {
  return (
    <Modal
      open={open}
      title="Delete Product"
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={loading}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ tone: 'danger' }}
    >
      <p>
        Are you sure you want to delete <strong>{productLabel}</strong>?
      </p>
      <p>This action cannot be undone.</p>
    </Modal>
  );
}
