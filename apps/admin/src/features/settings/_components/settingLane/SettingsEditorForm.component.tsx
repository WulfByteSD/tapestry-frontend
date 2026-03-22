// apps/admin/src/features/content/_components/settingsLane/SettingsEditorForm.tsx
"use client";

import { Button, Checkbox, TextField, TextAreaField } from "@tapestry/ui";
import styles from "./SettingsEditorForm.module.scss";

type Props = {
  mode: "create" | "edit";
  draft: {
    key: string;
    name: string;
    description: string;
    status: "draft" | "published" | "archived";
    tagsText: string;
    rulesetVersion: number;
    modules: {
      items: boolean;
      lore: boolean;
      maps: boolean;
      magic: boolean;
    };
  };
  setDraft: (updater: (prev: Props["draft"]) => Props["draft"]) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
};

export default function SettingsEditorForm({
  mode,
  draft,
  setDraft,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: Props) {
  return (
    <div className={styles.form}>
      <div className={styles.section}>
        <div className={styles.fieldRow}>
          <TextField
            floatingLabel
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          />

          <TextField
            floatingLabel
            label="Key"
            value={draft.key}
            onChange={(e) => setDraft((prev) => ({ ...prev, key: e.target.value }))}
            helpText="Slug-like identifier. Example: woven-realms"
          />
        </div>

        <TextAreaField
          floatingLabel
          label="Description"
          value={draft.description}
          onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.fieldRow}>
          <TextField
            floatingLabel
            label="Tags"
            value={draft.tagsText}
            onChange={(e) => setDraft((prev) => ({ ...prev, tagsText: e.target.value }))}
            helpText="Comma-separated"
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.checkboxGroup}>
          <h4 className={styles.checkboxGroupTitle}>Enabled Modules</h4>
          <div className={styles.checkboxList}>
            <Checkbox
              label="Items"
              checked={draft.modules.items}
              onChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  modules: { ...prev.modules, items: checked },
                }))
              }
            />

            <Checkbox
              label="Lore"
              checked={draft.modules.lore}
              onChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  modules: { ...prev.modules, lore: checked },
                }))
              }
            />

            <Checkbox
              label="Maps"
              checked={draft.modules.maps}
              onChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  modules: { ...prev.modules, maps: checked },
                }))
              }
            />

            <Checkbox
              label="Magic"
              checked={draft.modules.magic}
              onChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  modules: { ...prev.modules, magic: checked },
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={onSave} isLoading={isSaving}>
          {mode === "create" ? "Create setting" : "Save changes"}
        </Button>

        <Button variant="ghost" tone="neutral" onClick={onCancel}>
          Cancel
        </Button>

        {mode === "edit" && onDelete ? (
          <Button tone="danger" variant="outline" onClick={onDelete} isLoading={isDeleting}>
            Delete setting
          </Button>
        ) : null}
      </div>
    </div>
  );
}
