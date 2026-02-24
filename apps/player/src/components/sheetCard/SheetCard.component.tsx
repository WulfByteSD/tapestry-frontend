"use client";

import type { CharacterSheet } from "@tapestry/types";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Modal } from "@tapestry/ui";
import { BiCopy, BiTrash } from "react-icons/bi";
import { useDeleteCharacterMutation } from "@/features/characters/characterSheetScreen/characterSheet.mutations";
import styles from "./SheetCard.module.scss";

type Props = {
  character: CharacterSheet;
};

function formatRelative(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function SheetCard({ character: c }: Props) {
  const router = useRouter();
  const deleteMutation = useDeleteCharacterMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");

  const isDeleteEnabled = deleteConfirmName.trim() === c.name?.trim();

  const handleDuplicate = () => {
    // TODO: Implement character duplication
    console.log("TODO: duplicate", c._id);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!isDeleteEnabled) return;

    try {
      await deleteMutation.mutateAsync(c._id);
      setShowDeleteModal(false);
      // Optionally show success message or navigate away
    } catch (error) {
      console.error("Failed to delete character:", error);
      // Optionally show error message
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteConfirmName("");
  };

  return (
    <Card className={styles.sheetCard}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.headerRow}>
          <div className={styles.avatar}>
            {c.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.avatarImg} src={c.avatarUrl} alt={`${c.name} avatar`} />
            ) : (
              <div className={styles.avatarFallback} aria-hidden="true">
                {c.name?.slice(0, 1).toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className={styles.headerMain}>
            <div className={styles.cardTitleRow}>
              <div className={styles.cardTitle}>{c.name}</div>
              <div className={styles.badge}>
                {c.sheet.archetypeKey ?? "Adventurer"}
                {typeof c.sheet.weaveLevel === "number" ? ` · L${c.sheet.weaveLevel}` : ""}
              </div>
            </div>

            <div className={styles.meta}>
              Last updated: <span className={styles.metaValue}>{formatRelative(c.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.cardBody}>
        <div className={styles.actionRow}>
          <Button
            tone="gold"
            variant="solid"
            className={styles.openBtn}
            onClick={() => router.push(`/characters/${c._id}`)}
          >
            Open
          </Button>

          <Button
            tone="neutral"
            variant="ghost"
            size="sm"
            className={styles.iconBtn}
            aria-label="Duplicate character"
            title="Duplicate"
            onClick={handleDuplicate}
          >
            <BiCopy color="gold" />
          </Button>

          <Button
            tone="danger"
            variant="ghost"
            size="sm"
            className={styles.iconBtn}
            aria-label="Delete character"
            title="Delete"
            onClick={handleDelete}
          >
            <BiTrash color="rose" />
          </Button>
        </div>
      </CardBody>

      <Modal
        open={showDeleteModal}
        title="Delete Character"
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
        okText="Delete"
        cancelText="Cancel"
        confirmLoading={deleteMutation.isPending}
        okButtonProps={{
          tone: "danger",
          disabled: !isDeleteEnabled,
        }}
        centered
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            This action is <strong>irreversible</strong>. All character data will be permanently deleted.
          </p>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            To confirm, please type the character name: <strong>{c.name}</strong>
          </p>
          <Input
            type="text"
            placeholder={`Type "${c.name}" to confirm`}
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            hasError={deleteConfirmName.length > 0 && !isDeleteEnabled}
            autoFocus
          />
        </div>
      </Modal>
    </Card>
  );
}
