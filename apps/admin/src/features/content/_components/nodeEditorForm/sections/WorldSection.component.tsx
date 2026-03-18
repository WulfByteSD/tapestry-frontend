import type { NodeEditorFormValue } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type WorldSectionProps = {
  world: NodeEditorFormValue["meta"]["world"];
  onUpdateMeta: <
    TSection extends keyof NodeEditorFormValue["meta"],
    TKey extends keyof NodeEditorFormValue["meta"][TSection],
  >(
    section: TSection,
    key: TKey,
    value: NodeEditorFormValue["meta"][TSection][TKey],
  ) => void;
};

export default function WorldSection({ world, onUpdateMeta }: WorldSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>World</h3>
          <p className={styles.sectionCopy}>Mapping and timeline context without burying it in the body text.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Region label</span>
          <input
            className={styles.input}
            value={world.regionLabel}
            onChange={(event) => onUpdateMeta("world", "regionLabel", event.target.value)}
            placeholder="Eastern Ward"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Era</span>
          <input
            className={styles.input}
            value={world.era}
            onChange={(event) => onUpdateMeta("world", "era", event.target.value)}
            placeholder="Age of Lanterns"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Map coordinate X</span>
          <input
            className={styles.input}
            value={world.coordX}
            onChange={(event) => onUpdateMeta("world", "coordX", event.target.value)}
            placeholder="128"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Map coordinate Y</span>
          <input
            className={styles.input}
            value={world.coordY}
            onChange={(event) => onUpdateMeta("world", "coordY", event.target.value)}
            placeholder="64"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Timeline note</span>
        <textarea
          className={styles.textareaShort}
          value={world.timelineNote}
          onChange={(event) => onUpdateMeta("world", "timelineNote", event.target.value)}
          placeholder="Useful timeline context, reign period, or campaign-era note."
        />
      </label>
    </section>
  );
}
