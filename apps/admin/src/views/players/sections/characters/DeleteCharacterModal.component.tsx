'use client';

import { useState } from 'react';
import { Input, Modal } from '@tapestry/ui';
import styles from './DeleteCharacterModal.module.scss';

type Props = {
  open: boolean;
  characterId: string;
  characterName: string;
  loading: boolean;
  onConfirm: (characterId: string) => void;
  onClose: () => void;
};

export default function DeleteCharacterModal({ open, characterId, characterName, loading, onConfirm, onClose }: Props) {
  const [confirmName, setConfirmName] = useState('');
  const isDeleteEnabled = confirmName.trim() === characterName.trim();

  const handleConfirm = () => {
    if (!isDeleteEnabled) return;
    onConfirm(characterId);
  };

  const handleCancel = () => {
    onClose();
    setConfirmName('');
  };

  return (
    <Modal
      open={open}
      title="Delete Character"
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Delete"
      cancelText="Cancel"
      confirmLoading={loading}
      okButtonProps={{
        tone: 'danger',
        disabled: !isDeleteEnabled,
      }}
      centered
    >
      <div className={styles.content}>
        <p className={styles.warning}>
          This action is <strong>irreversible</strong>. All character data will be permanently deleted.
        </p>
        <p className={styles.confirmInstruction}>
          To confirm, type the character name: <strong>{characterName}</strong>
        </p>
        <Input
          type="text"
          placeholder={`Type "${characterName}" to confirm`}
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          hasError={confirmName.length > 0 && !isDeleteEnabled}
          autoFocus
        />
      </div>
    </Modal>
  );
}
