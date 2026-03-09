"use client";

import { useState } from "react";
import { Input, Modal } from "@tapestry/ui";
import { useDeleteCharacterMutation } from "@/features/characters/characterSheetScreen/characterSheet.mutations";
import styles from "./DeleteModal.module.scss";

type Props = {
  open: boolean;
  characterId: string;
  characterName: string;
  onClose: () => void;
};

export default function DeleteModal({ open, characterId, characterName, onClose }: Props) {
  const [confirmName, setConfirmName] = useState("");
  const deleteMutation = useDeleteCharacterMutation();
  const isDeleteEnabled = confirmName.trim() === characterName.trim();

  const handleConfirm = async () => {
    if (!isDeleteEnabled) return;

    try {
      await deleteMutation.mutateAsync(characterId);
      onClose();
      setConfirmName(""); // Reset for next time
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  const handleCancel = () => {
    onClose();
    setConfirmName(""); // Reset for next time
  };

  return (
    <Modal
      open={open}
      title="Delete Character"
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Delete"
      cancelText="Cancel"
      confirmLoading={deleteMutation.isPending}
      okButtonProps={{
        tone: "danger",
        disabled: !isDeleteEnabled,
      }}
      centered
    >
      <div className={styles.content}>
        <p className={styles.warning}>
          This action is <strong>irreversible</strong>. All character data will be permanently deleted.
        </p>
        <p className={styles.confirmInstruction}>
          To confirm, please type the character name: <strong>{characterName}</strong>
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
