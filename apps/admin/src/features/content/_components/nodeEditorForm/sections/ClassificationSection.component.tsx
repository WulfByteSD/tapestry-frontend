import type { NodeEditorFormValue } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type ClassificationSectionProps = {
  classification: NodeEditorFormValue["meta"]["classification"];
  onUpdateMeta: <
    TSection extends keyof NodeEditorFormValue["meta"],
    TKey extends keyof NodeEditorFormValue["meta"][TSection],
  >(
    section: TSection,
    key: TKey,
    value: NodeEditorFormValue["meta"][TSection][TKey],
  ) => void;
};

export default function ClassificationSection({ classification, onUpdateMeta }: ClassificationSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Classification</h3>
          <p className={styles.sectionCopy}>Searchable world-facing facts. Useful now, and even more useful later.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Species</span>
          <input
            className={styles.input}
            value={classification.species}
            onChange={(event) => onUpdateMeta("classification", "species", event.target.value)}
            placeholder="Human"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Culture</span>
          <input
            className={styles.input}
            value={classification.culture}
            onChange={(event) => onUpdateMeta("classification", "culture", event.target.value)}
            placeholder="Everpine frontier"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Occupation</span>
          <input
            className={styles.input}
            value={classification.occupation}
            onChange={(event) => onUpdateMeta("classification", "occupation", event.target.value)}
            placeholder="Militia captain"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Region</span>
          <input
            className={styles.input}
            value={classification.region}
            onChange={(event) => onUpdateMeta("classification", "region", event.target.value)}
            placeholder="The Northwood March"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Settlement</span>
          <input
            className={styles.input}
            value={classification.settlement}
            onChange={(event) => onUpdateMeta("classification", "settlement", event.target.value)}
            placeholder="Everpine"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Affiliation</span>
        <input
          className={styles.input}
          value={classification.affiliation}
          onChange={(event) => onUpdateMeta("classification", "affiliation", event.target.value)}
          placeholder="Everpine Council, Militia of Everpine"
        />
        <span className={styles.helper}>Comma-separated.</span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Religion</span>
        <input
          className={styles.input}
          value={classification.religion}
          onChange={(event) => onUpdateMeta("classification", "religion", event.target.value)}
          placeholder="Followers of the Lantern"
        />
        <span className={styles.helper}>Comma-separated.</span>
      </label>
    </section>
  );
}
