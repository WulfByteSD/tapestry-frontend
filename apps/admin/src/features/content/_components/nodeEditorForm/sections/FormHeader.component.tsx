import styles from "../NodeEditorForm.module.scss";

type FormHeaderProps = {
  formTitle: string;
  formCopy: string;
  mode: string;
  submitLabel: string;
  canSave: boolean;
  isSaving: boolean;
};

export default function FormHeader({ formTitle, formCopy, mode, submitLabel, canSave, isSaving }: FormHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Node editor</p>
        <h2 className={styles.title}>{formTitle}</h2>
        <p className={styles.copy}>{formCopy}</p>
        <strong className={styles.metaValue}>{mode}</strong>
      </div>

      <div className={styles.actionRow}>
        <button type="submit" className={styles.primaryButton} disabled={!canSave || isSaving}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
