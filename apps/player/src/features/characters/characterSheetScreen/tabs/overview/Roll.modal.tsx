import { Button, Modal } from "@tapestry/ui";
import styles from "./Roll.modal.module.scss";

type Props = {
  label: string;
  value?: number;
  onClose: () => void;
};

export function RollModal({ label, value, onClose }: Props) {
  const footer = (
    <>
      <Button tone="purple" variant="outline" onClick={onClose}>
        Close
      </Button>
      <Button tone="gold" onClick={onClose}>
        Roll (stub)
      </Button>
    </>
  );

  return (
    <Modal open={true} title="Roll" onCancel={onClose} footer={footer} width={420} centered>
      <div className={styles.modalBody}>
        <div className={styles.modalLabel}>{label}</div>
        <div className={styles.modalValue}>Value: {value ?? "—"}</div>
        <div className={styles.muted}>Roll UX comes next (dice UI + Thread/Resolve spends).</div>
      </div>
    </Modal>
  );
}
