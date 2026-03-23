import { TextField, TextAreaField } from "@tapestry/ui";
import type { NodeEditorFormValue } from "../NodeEditorForm.types";

type ContentFieldsProps = {
  form: NodeEditorFormValue;
  onUpdate: (updates: Partial<NodeEditorFormValue>) => void;
};

export default function ContentFields({ form, onUpdate }: ContentFieldsProps) {
  return (
    <>
      <TextField
        floatingLabel
        label="Tags"
        value={form.tags}
        onChange={(event) => onUpdate({ tags: event.target.value })}
        placeholder="frontier, council, shrine, lantern"
        helpText="Comma-separated. Keep them boring and useful."
      />

      <TextAreaField
        floatingLabel
        label="Summary"
        value={form.summary}
        onChange={(event) => onUpdate({ summary: event.target.value })}
        placeholder="Short admin-facing summary for previews."
        rows={3}
      />

      <TextAreaField
        floatingLabel
        label="Body"
        value={form.body}
        onChange={(event) => onUpdate({ body: event.target.value })}
        placeholder="Full lore entry..."
        rows={8}
      />
    </>
  );
}
