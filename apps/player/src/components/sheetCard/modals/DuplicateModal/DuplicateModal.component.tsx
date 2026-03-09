"use client";

import { useState } from "react";
import { Modal } from "@tapestry/ui";
import { useDuplicateCharacterMutation } from "@/features/characters/characterSheetScreen/characterSheet.mutations";
import styles from "./DuplicateModal.module.scss";

type Props = {
  open: boolean;
  characterId: string;
  characterName: string;
  onClose: () => void;
};

export default function DuplicateModal({ open, characterId, characterName, onClose }: Props) {
  const [copyAllData, setCopyAllData] = useState(true);
  const duplicateMutation = useDuplicateCharacterMutation();

  const handleConfirm = async () => {
    try {
      await duplicateMutation.mutateAsync({ characterId, copyAllData });
      onClose();
      setCopyAllData(true); // Reset for next time
    } catch (error) {
      console.error("Failed to duplicate character:", error);
    }
  };

  const handleCancel = () => {
    onClose();
    setCopyAllData(true); // Reset for next time
  };
  return (
    <Modal
      open={open}
      title="Duplicate Character"
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Duplicate"
      cancelText="Cancel"
      confirmLoading={duplicateMutation.isPending}
      okButtonProps={{
        tone: "gold",
      }}
      centered
    >
      <div className={styles.content}>
        <p className={styles.description}>
          Choose how to duplicate <strong>{characterName}</strong>:
        </p>

        <div className={styles.optionsContainer}>
          <label className={`${styles.optionLabel} ${copyAllData ? styles.selected : ""}`}>
            <input
              type="radio"
              name="duplicateMode"
              checked={copyAllData}
              onChange={() => setCopyAllData(true)}
              className={styles.optionRadio}
            />
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>Full Copy</div>
              <div className={styles.optionDescription}>
                Copy everything: profile, abilities, skills, inventory, and stats
              </div>
            </div>
          </label>

          <label className={`${styles.optionLabel} ${!copyAllData ? styles.selected : ""}`}>
            <input
              type="radio"
              name="duplicateMode"
              checked={!copyAllData}
              onChange={() => setCopyAllData(false)}
              className={styles.optionRadio}
            />
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>Fresh Start</div>
              <div className={styles.optionDescription}>
                Copy only profile data. Start fresh with abilities, skills, and inventory
              </div>
            </div>
          </label>
        </div>

        <p className={styles.footer}>
          The duplicate will appear in your character list with "(Copy)" appended to the name.
        </p>
      </div>
    </Modal>
  );
}
