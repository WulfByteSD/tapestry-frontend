import type { NodeEditorFormValue } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type ContentFieldsProps = {
  form: NodeEditorFormValue;
  onUpdate: (updates: Partial<NodeEditorFormValue>) => void;
};

export default function ContentFields({ form, onUpdate }: ContentFieldsProps) {
  return (
    <>
      <label className={styles.field}>
        <span className={styles.label}>Tags</span>
        <input
          className={styles.input}
          value={form.tags}
          onChange={(event) => onUpdate({ tags: event.target.value })}
          placeholder="frontier, council, shrine, lantern"
        />
        <span className={styles.helper}>Comma-separated. Keep them boring and useful.</span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Summary</span>
        <textarea
          className={styles.textareaShort}
          value={form.summary}
          onChange={(event) => onUpdate({ summary: event.target.value })}
          placeholder="Short admin-facing summary for previews."
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Body</span>
        <textarea
          className={styles.textarea}
          value={form.body}
          onChange={(event) => onUpdate({ body: event.target.value })}
          placeholder="Full lore entry..."
        />
      </label>
    </>
  );
}
