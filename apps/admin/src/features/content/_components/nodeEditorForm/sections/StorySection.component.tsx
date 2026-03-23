import type { NodeEditorFormValue } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type StorySectionProps = {
  story: NodeEditorFormValue["meta"]["story"];
  onUpdateMeta: <
    TSection extends keyof NodeEditorFormValue["meta"],
    TKey extends keyof NodeEditorFormValue["meta"][TSection],
  >(
    section: TSection,
    key: TKey,
    value: NodeEditorFormValue["meta"][TSection][TKey],
  ) => void;
};

export default function StorySection({ story, onUpdateMeta }: StorySectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Story aids</h3>
          <p className={styles.sectionCopy}>
            Fast table-facing material that should not be buried in one long lore essay.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Hooks</span>
          <textarea
            className={styles.textareaShort}
            value={story.hooks}
            onChange={(event) => onUpdateMeta("story", "hooks", event.target.value)}
            placeholder={"One per line\nEscort the shrine maiden\nRecover the lost lantern"}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Rumors</span>
          <textarea
            className={styles.textareaShort}
            value={story.rumors}
            onChange={(event) => onUpdateMeta("story", "rumors", event.target.value)}
            placeholder={"One per line\nShe speaks with the dead\nThe shrine hides a relic"}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Secrets</span>
          <textarea
            className={styles.textareaShort}
            value={story.secrets}
            onChange={(event) => onUpdateMeta("story", "secrets", event.target.value)}
            placeholder={"One per line\nKnows the council is divided"}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Quotes</span>
          <textarea
            className={styles.textareaShort}
            value={story.quotes}
            onChange={(event) => onUpdateMeta("story", "quotes", event.target.value)}
            placeholder={"One per line\nThe lantern does not judge. It reveals."}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>GM notes</span>
        <textarea
          className={styles.textareaShort}
          value={story.gmNotes}
          onChange={(event) => onUpdateMeta("story", "gmNotes", event.target.value)}
          placeholder={"One per line\nSoft-spoken until faith is challenged"}
        />
      </label>
    </section>
  );
}
