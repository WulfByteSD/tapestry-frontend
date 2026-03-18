import { type RefObject } from "react";
import { TextField, SelectField } from "@tapestry/ui";
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
      <TextField
        floatingLabel
        label="Name"
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

      <TextField
        floatingLabel
        label="Key"
        value={form.key}
        onChange={(event) => {
          keyTouchedRef.current = true;
          onUpdate({ key: slugifyKey(event.target.value) });
        }}
        placeholder="ilyra-fenwick"
      />

      <SelectField
        label="Kind"
        value={form.kind}
        onChange={(event) => onUpdate({ kind: event.target.value as NodeEditorFormValue["kind"] })}
      >
        {LORE_KIND_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>

      <SelectField 
        label="Status"
        value={form.status}
        onChange={(event) => onUpdate({ status: event.target.value as NodeEditorFormValue["status"] })}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectField>

      <SelectField 
        label="Parent"
        value={form.parentId}
        onChange={(event) => onUpdate({ parentId: event.target.value })}
      >
        <option value="">No parent (root node)</option>
        {parentOptions.map((option) => (
          <option key={option._id} value={option._id}>
            {formatParentLabel(option)}
          </option>
        ))}
      </SelectField>

      <TextField
        floatingLabel
        label="Sort order"
        type="number"
        value={form.sortOrder}
        onChange={(event) => onUpdate({ sortOrder: event.target.value })}
        placeholder="0"
      />
    </div>
  );
}
