'use client';

import { useState } from 'react';
import { Modal } from '@tapestry/ui';
import styles from './RosterTab.module.scss';

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: (nickname: string) => void;
  currentNickname: string;
  memberName: string;
  loading?: boolean;
};

export function EditNicknameModal({ open, onCancel, onConfirm, currentNickname, memberName, loading }: Props) {
  const [nickname, setNickname] = useState(currentNickname);

  const handleConfirm = () => {
    onConfirm(nickname.trim());
  };

  const handleCancel = () => {
    setNickname(currentNickname); // Reset to current nickname on cancel
    onCancel();
  };

  const handleClear = () => {
    setNickname('');
  };

  const hasChanged = nickname.trim() !== currentNickname;

  return (
    <Modal
      open={open}
      title={`Edit Nickname for ${memberName}`}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={loading}
      okButtonProps={{ disabled: !hasChanged || !nickname.trim() }}
      width={480}
      centered
    >
      <div className={styles.modalContent}>
        <p className={styles.modalDescription}>Set a custom nickname for this member in this campaign:</p>

        <div className={styles.inputGroup}>
          <label htmlFor="nickname" className={styles.inputLabel}>
            Nickname
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="nickname"
              type="text"
              className={styles.textInput}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter nickname..."
              maxLength={50}
              autoFocus
            />
            {nickname && (
              <button type="button" className={styles.clearButton} onClick={handleClear} title="Clear nickname">
                ✕
              </button>
            )}
          </div>
          <span className={styles.inputHint}>{nickname.length}/50 characters</span>
        </div>
      </div>
    </Modal>
  );
}
