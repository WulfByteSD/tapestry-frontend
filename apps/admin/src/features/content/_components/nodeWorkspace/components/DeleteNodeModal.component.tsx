"use client";

import { Modal, Switcher } from "@tapestry/ui";

type DeleteNodeModalProps = {
  open: boolean;
  nodeName: string | null | undefined;
  childCount: number;
  descendantCount: number;
  reassignChildren: boolean;
  isDeleting: boolean;
  onReassignChildrenChange: (value: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteNodeModal({
  open,
  nodeName,
  childCount,
  descendantCount,
  reassignChildren,
  isDeleting,
  onReassignChildrenChange,
  onConfirm,
  onCancel,
}: DeleteNodeModalProps) {
  return (
    <Modal
      open={open}
      title="Delete Node"
      onCancel={onCancel}
      onOk={onConfirm}
      okText="Delete"
      cancelText="Cancel"
      confirmLoading={isDeleting}
      okButtonProps={{ tone: "danger" }}
      width={480}
      centered
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ margin: 0 }}>
          Are you sure you want to delete <strong>"{nodeName}"</strong>?
        </p>

        {childCount > 0 && (
          <>
            <p style={{ margin: 0, color: "var(--text-secondary, #999)" }}>
              This node has <strong>{childCount}</strong> direct child{childCount > 1 ? "ren" : ""} and{" "}
              <strong>{descendantCount}</strong> total descendant{descendantCount > 1 ? "s" : ""}.
            </p>

            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "var(--surface-2, rgba(255, 255, 255, 0.05))",
              }}
            >
              <Switcher
                checked={reassignChildren}
                onChange={onReassignChildrenChange}
                label="Reassign children to parent"
                size="md"
              />
            </div>

            {!reassignChildren && (
              <p
                style={{
                  margin: 0,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "rgba(220, 53, 69, 0.1)",
                  color: "#dc3545",
                  fontWeight: 600,
                }}
              >
                ⚠️ Warning: This will permanently delete ALL {descendantCount} descendant node
                {descendantCount > 1 ? "s" : ""}.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
