import type { NodeEditorFormValue } from "../NodeEditorForm.types";
import styles from "../NodeEditorForm.module.scss";

type IdentitySectionProps = {
  identity: NodeEditorFormValue["meta"]["identity"];
  onUpdateMeta: <
    TSection extends keyof NodeEditorFormValue["meta"],
    TKey extends keyof NodeEditorFormValue["meta"][TSection],
  >(
    section: TSection,
    key: TKey,
    value: NodeEditorFormValue["meta"][TSection][TKey],
  ) => void;
};

export default function IdentitySection({ identity, onUpdateMeta }: IdentitySectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Identity</h3>
          <p className={styles.sectionCopy}>Short structured facts that help this node read like a real world entry.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Subtitle</span>
          <input
            className={styles.input}
            value={identity.subtitle}
            onChange={(event) => onUpdateMeta("identity", "subtitle", event.target.value)}
            placeholder="Shrine Maiden of Everpine"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Epithet</span>
          <input
            className={styles.input}
            value={identity.epithet}
            onChange={(event) => onUpdateMeta("identity", "epithet", event.target.value)}
            placeholder="The Lantern's Quiet Flame"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Title</span>
          <input
            className={styles.input}
            value={identity.title}
            onChange={(event) => onUpdateMeta("identity", "title", event.target.value)}
            placeholder="Captain, Lord, Elder..."
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Pronunciation</span>
          <input
            className={styles.input}
            value={identity.pronunciation}
            onChange={(event) => onUpdateMeta("identity", "pronunciation", event.target.value)}
            placeholder="ill-EE-rah FEN-wick"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Aliases</span>
        <input
          className={styles.input}
          value={identity.aliases}
          onChange={(event) => onUpdateMeta("identity", "aliases", event.target.value)}
          placeholder="Lantern Daughter, Keeper of the East Shrine"
        />
        <span className={styles.helper}>Comma-separated.</span>
      </label>
    </section>
  );
}
