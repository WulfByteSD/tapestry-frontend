import styles from "../NodeEditorForm.module.scss";

type FormHeaderProps = {
  formTitle: string;
  formCopy: string;
  mode: string;
  submitLabel: string;
  canSave: boolean;
  isSaving: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
};

export default function FormHeader({
  formTitle,
  formCopy,
  mode,
  submitLabel,
  canSave,
  isSaving,
  isDeleting,
  onDelete,
}: FormHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Node editor</p>
        <h2 className={styles.title}>{formTitle}</h2>
        <p className={styles.copy}>{formCopy}</p>
        <strong className={styles.metaValue}>{mode}</strong>
      </div>

      <div className={styles.actionRow}>
        {mode === "edit" && onDelete && (
          <button type="button" className={styles.dangerButton} onClick={onDelete} disabled={isSaving || isDeleting}>
            {isDeleting ? "Deleting…" : "Delete node"}
          </button>
        )}
        <button type="submit" className={styles.primaryButton} disabled={!canSave || isSaving}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
