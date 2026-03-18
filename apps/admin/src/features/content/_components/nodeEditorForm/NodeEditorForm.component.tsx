"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NodeEditorForm.module.scss";

// Adjust this import path to wherever your existing relation editor lives now.
import RelationEditor from "../relationEditor/RelationEditor.component";
import { NodeEditorParentOption } from "../nodeWorkspace/nodeWorkspace.types";

const LORE_KIND_OPTIONS = [
  "region",
  "nation",
  "province",
  "settlement",
  "district",
  "landmark",
  "faction",
  "npc",
  "organization",
  "culture",
  "religion",
  "event",
  "history",
  "other",
] as const;

const STATUS_OPTIONS = ["draft", "published", "archived"] as const;

function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatParentLabel(option: NodeEditorParentOption) {
  const indent = "— ".repeat(Math.max(option.depth, 0));
  return `${indent}${option.name} (${option.kind})`;
}

function toTagsInput(tags?: string[]) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export function toTagArray(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export type NodeRelationDraft = {
  type: string;
  targetKey: string;
  label?: string;
  notes?: string;
};

export type NodeEditorFormValue = {
  settingKey: string;
  name: string;
  key: string;
  kind: (typeof LORE_KIND_OPTIONS)[number];
  status: (typeof STATUS_OPTIONS)[number];
  parentId: string;
  sortOrder: string;
  tags: string;
  summary: string;
  body: string;
  relations: NodeRelationDraft[];
};

export type NodeEditorFormMode = "edit" | "create-root" | "create-child";

type NodeEditorFormProps = {
  initialValue: NodeEditorFormValue;
  parentOptions: NodeEditorParentOption[];
  relationTargets: NodeEditorParentOption[];
  isSaving?: boolean;
  saveMessage?: string | null;
  mode?: NodeEditorFormMode;
  onSave: (value: NodeEditorFormValue) => Promise<void> | void;
};

export default function NodeEditorForm({
  initialValue,
  parentOptions,
  relationTargets,
  mode = "edit",
  isSaving = false,
  saveMessage,
  onSave,
}: NodeEditorFormProps) {
  const [form, setForm] = useState<NodeEditorFormValue>(initialValue);
  const [formError, setFormError] = useState<string | null>(null);
  const keyTouchedRef = useRef(false);

  useEffect(() => {
    setForm(initialValue);
    setFormError(null);
    keyTouchedRef.current = false;
  }, [initialValue]);

  useEffect(() => {
    if (keyTouchedRef.current) return;

    setForm((current) => ({
      ...current,
      key: slugifyKey(current.name),
    }));
  }, [form.name]);
  const formTitle =
    mode === "create-child" ? "Create child node" : mode === "create-root" ? "Create root node" : "Edit node";

  const formCopy =
    mode === "create-child"
      ? "Create a new child lore node under the selected parent. You can still change the parent before saving."
      : mode === "create-root"
        ? "Create a new root-level lore node for this setting. Keep parent/child strictly for containment."
        : "This is the full lore editor again — parent, tags, body, and relations — just moved onto the dedicated node page where it belongs.";

  const submitLabel = isSaving
    ? mode === "edit"
      ? "Saving…"
      : "Creating…"
    : mode === "edit"
      ? "Save node"
      : "Create node";

  const canSave = useMemo(() => {
    return Boolean(form.name.trim() && form.key.trim() && form.settingKey.trim());
  }, [form.key, form.name, form.settingKey]);

  const parentName = parentOptions.find((option) => option._id === form.parentId)?.name ?? null;

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        setFormError(null);

        if (!form.name.trim()) {
          setFormError("Lore nodes need a name.");
          return;
        }

        if (!form.key.trim()) {
          setFormError("Lore nodes need a key.");
          return;
        }

        await onSave({
          ...form,
          key: slugifyKey(form.key),
        });
      }}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Node editor</p>
          <h2 className={styles.title}>{formTitle}</h2>

          <p className={styles.copy}>{formCopy}</p>

          <strong className={styles.metaValue}>{mode}</strong>
        </div>

        <div className={styles.actionRow}>
          <button type="submit" className={styles.primaryButton} disabled={!canSave || isSaving}>
            {submitLabel}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Name</span>
          <input
            className={styles.input}
            value={form.name}
            onChange={(event) => {
              const nextName = event.target.value;

              setForm((current) => ({
                ...current,
                name: nextName,
                key: keyTouchedRef.current ? current.key : slugifyKey(nextName),
              }));
            }}
            placeholder="Everpine, Isabella, Followers of the Lantern..."
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Key</span>
          <input
            className={styles.input}
            value={form.key}
            onChange={(event) => {
              keyTouchedRef.current = true;
              setForm((current) => ({
                ...current,
                key: slugifyKey(event.target.value),
              }));
            }}
            placeholder="isabella"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Kind</span>
          <select
            className={styles.select}
            value={form.kind}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                kind: event.target.value as NodeEditorFormValue["kind"],
              }))
            }
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
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as NodeEditorFormValue["status"],
              }))
            }
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
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                parentId: event.target.value,
              }))
            }
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
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                sortOrder: event.target.value,
              }))
            }
            placeholder="0"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Tags</span>
        <input
          className={styles.input}
          value={form.tags}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              tags: event.target.value,
            }))
          }
          placeholder="frontier, shrine, lantern, middletown"
        />
        <span className={styles.helper}>Comma-separated. Keep them boring and useful.</span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Summary</span>
        <textarea
          className={styles.textareaShort}
          value={form.summary}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              summary: event.target.value,
            }))
          }
          placeholder="Short admin-facing summary for previews."
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Body</span>
        <textarea
          className={styles.textarea}
          value={form.body}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              body: event.target.value,
            }))
          }
          placeholder="Full lore entry..."
        />
      </label>

      <div className={styles.metaStrip}>
        <div className={styles.metaCard}>
          <span className={styles.metaLabel}>Setting</span>
          <strong className={styles.metaValue}>{form.settingKey}</strong>
        </div>

        <div className={styles.metaCard}>
          <span className={styles.metaLabel}>Parent</span>
          <strong className={styles.metaValue}>{parentName ?? "Root"}</strong>
        </div>

        <div className={styles.metaCard}>
          <span className={styles.metaLabel}>Mode</span>
          <strong className={styles.metaValue}>edit</strong>
        </div>
      </div>

      {formError ? <div className={styles.error}>{formError}</div> : null}

      <RelationEditor
        value={form.relations}
        onChange={(relations) =>
          setForm((current) => ({
            ...current,
            relations,
          }))
        }
        targets={relationTargets}
        disabled={isSaving}
      />

      {saveMessage ? <div className={styles.success}>{saveMessage}</div> : null}
    </form>
  );
}
