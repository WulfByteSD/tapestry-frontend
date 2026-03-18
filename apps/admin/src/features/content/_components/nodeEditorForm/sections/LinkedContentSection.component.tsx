import type { NodeEditorFormValue, NodeLinkedContentDraft } from "../NodeEditorForm.types";
import { LINKED_CONTENT_OPTIONS } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type LinkedContentSectionProps = {
  linkedContent: NodeEditorFormValue["linkedContent"];
  onAddLinkedContent: () => void;
  onUpdateLinkedContent: (itemId: string, patch: Partial<NodeLinkedContentDraft>) => void;
  onRemoveLinkedContent: (itemId: string) => void;
};

export default function LinkedContentSection({
  linkedContent,
  onAddLinkedContent,
  onUpdateLinkedContent,
  onRemoveLinkedContent,
}: LinkedContentSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Linked content</h3>
          <p className={styles.sectionCopy}>Cross-system references. Start small: combatants first.</p>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={onAddLinkedContent}>
          Add linked content
        </button>
      </div>

      {linkedContent.length ? (
        <div className={styles.stack}>
          {linkedContent.map((item) => (
            <div key={item.id} className={styles.rowCard}>
              <div className={styles.grid}>
                <label className={styles.field}>
                  <span className={styles.label}>Type</span>
                  <select
                    className={styles.select}
                    value={item.type}
                    onChange={(event) =>
                      onUpdateLinkedContent(item.id, {
                        type: event.target.value as NodeLinkedContentDraft["type"],
                      })
                    }
                  >
                    {LINKED_CONTENT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Target ID</span>
                  <input
                    className={styles.input}
                    value={item.targetId}
                    onChange={(event) => onUpdateLinkedContent(item.id, { targetId: event.target.value })}
                    placeholder="combatant id"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Label</span>
                  <input
                    className={styles.input}
                    value={item.label}
                    onChange={(event) => onUpdateLinkedContent(item.id, { label: event.target.value })}
                    placeholder="Captain Varrick combat profile"
                  />
                </label>
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={() => onRemoveLinkedContent(item.id)}>
                  Remove link
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.helper}>No linked content yet.</p>
      )}
    </section>
  );
}
