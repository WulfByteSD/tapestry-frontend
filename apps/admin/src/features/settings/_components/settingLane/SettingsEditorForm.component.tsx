// apps/admin/src/features/content/_components/settingsLane/SettingsEditorForm.tsx
"use client";

import { Button, TextField, TextAreaField } from "@tapestry/ui";

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
    <div>
      <TextField
        label="Name"
        value={draft.name}
        onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
      />

      <TextField
        label="Key"
        value={draft.key}
        onChange={(e) => setDraft((prev) => ({ ...prev, key: e.target.value }))}
        helpText="Slug-like identifier. Example: woven-realms"
      />

      <TextAreaField
        label="Description"
        value={draft.description}
        onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
      />

      <TextField
        label="Tags"
        value={draft.tagsText}
        onChange={(e) => setDraft((prev) => ({ ...prev, tagsText: e.target.value }))}
        helpText="Comma-separated"
      />

      <TextField
        label="Ruleset version"
        type="number"
        value={String(draft.rulesetVersion)}
        onChange={(e) =>
          setDraft((prev) => ({
            ...prev,
            rulesetVersion: Number(e.target.value || 1),
          }))
        }
      />

      <div>
        <label>
          <input
            type="checkbox"
            checked={draft.modules.items}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                modules: { ...prev.modules, items: e.target.checked },
              }))
            }
          />
          Items
        </label>

        <label>
          <input
            type="checkbox"
            checked={draft.modules.lore}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                modules: { ...prev.modules, lore: e.target.checked },
              }))
            }
          />
          Lore
        </label>

        <label>
          <input
            type="checkbox"
            checked={draft.modules.maps}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                modules: { ...prev.modules, maps: e.target.checked },
              }))
            }
          />
          Maps
        </label>

        <label>
          <input
            type="checkbox"
            checked={draft.modules.magic}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                modules: { ...prev.modules, magic: e.target.checked },
              }))
            }
          />
          Magic
        </label>
      </div>

      <div>
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
