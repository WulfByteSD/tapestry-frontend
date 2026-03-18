import { type RefObject } from "react";
import type { NodeEditorFormValue } from "../NodeEditorForm.types";
import type { NodeEditorParentOption } from "../../nodeWorkspace/nodeWorkspace.types";
import { LORE_KIND_OPTIONS, STATUS_OPTIONS } from "../NodeEditorForm.types";
import { slugifyKey, formatParentLabel } from "../NodeEditorForm.helpers";
import styles from "../NodeEditorForm.module.scss";

type CoreFieldsProps = {
  form: NodeEditorFormValue;
  parentOptions: NodeEditorParentOption[];
  keyTouchedRef: RefObject<boolean>;
  onUpdate: (updates: Partial<NodeEditorFormValue>) => void;
};

export default function CoreFields({ form, parentOptions, keyTouchedRef, onUpdate }: CoreFieldsProps) {
  return (
    <div className={styles.grid}>
      <label className={styles.field}>
        <span className={styles.label}>Name</span>
        <input
          className={styles.input}
          value={form.name}
          onChange={(event) => {
            const nextName = event.target.value;
            onUpdate({
              name: nextName,
              key: keyTouchedRef.current ? form.key : slugifyKey(nextName),
            });
          }}
          placeholder="Everpine, Ilyra Fenwick, Followers of the Lantern..."
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Key</span>
        <input
          className={styles.input}
          value={form.key}
          onChange={(event) => {
            keyTouchedRef.current = true;
            onUpdate({ key: slugifyKey(event.target.value) });
          }}
          placeholder="ilyra-fenwick"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Kind</span>
        <select
          className={styles.select}
          value={form.kind}
          onChange={(event) => onUpdate({ kind: event.target.value as NodeEditorFormValue["kind"] })}
        >
          {LORE_KIND_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Status</span>
        <select
          className={styles.select}
          value={form.status}
          onChange={(event) => onUpdate({ status: event.target.value as NodeEditorFormValue["status"] })}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Parent</span>
        <select
          className={styles.select}
          value={form.parentId}
          onChange={(event) => onUpdate({ parentId: event.target.value })}
        >
          <option value="">No parent (root node)</option>
          {parentOptions.map((option) => (
            <option key={option._id} value={option._id}>
              {formatParentLabel(option)}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Sort order</span>
        <input
          className={styles.input}
          type="number"
          value={form.sortOrder}
          onChange={(event) => onUpdate({ sortOrder: event.target.value })}
          placeholder="0"
        />
      </label>
    </div>
  );
}
