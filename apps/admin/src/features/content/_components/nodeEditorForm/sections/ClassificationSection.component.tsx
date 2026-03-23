import { TextField } from "@tapestry/ui";
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
        <TextField
          floatingLabel
          label="Species"
          value={classification.species}
          onChange={(event) => onUpdateMeta("classification", "species", event.target.value)}
          placeholder="Human"
        />

        <TextField
          floatingLabel
          label="Culture"
          value={classification.culture}
          onChange={(event) => onUpdateMeta("classification", "culture", event.target.value)}
          placeholder="Everpine frontier"
        />

        <TextField
          floatingLabel
          label="Occupation"
          value={classification.occupation}
          onChange={(event) => onUpdateMeta("classification", "occupation", event.target.value)}
          placeholder="Militia captain"
        />

        <TextField
          floatingLabel
          label="Region"
          value={classification.region}
          onChange={(event) => onUpdateMeta("classification", "region", event.target.value)}
          placeholder="The Northwood March"
        />

        <TextField
          floatingLabel
          label="Settlement"
          value={classification.settlement}
          onChange={(event) => onUpdateMeta("classification", "settlement", event.target.value)}
          placeholder="Everpine"
        />
      </div>

      <TextField
        floatingLabel
        label="Affiliation"
        value={classification.affiliation}
        onChange={(event) => onUpdateMeta("classification", "affiliation", event.target.value)}
        placeholder="Everpine Council, Militia of Everpine"
        helpText="Comma-separated."
      />

      <TextField
        floatingLabel
        label="Religion"
        value={classification.religion}
        onChange={(event) => onUpdateMeta("classification", "religion", event.target.value)}
        placeholder="Followers of the Lantern"
        helpText="Comma-separated."
      />
    </section>
  );
}
