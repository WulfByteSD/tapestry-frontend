"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./NodeEditorForm.module.scss";

export type NodeEditorFormValue = {
  name: string;
  key: string;
  kind: string;
  status: "draft" | "published" | "archived";
  sortOrder: string;
  tags: string;
  summary: string;
  body: string;
};

type NodeEditorFormProps = {
  initialValue: NodeEditorFormValue;
  isSaving?: boolean;
  saveMessage?: string | null;
  onSave: (value: NodeEditorFormValue) => Promise<void> | void;
};

const KIND_OPTIONS = [
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

function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export default function NodeEditorForm({ initialValue, isSaving = false, saveMessage, onSave }: NodeEditorFormProps) {
  const [form, setForm] = useState<NodeEditorFormValue>(initialValue);
  const [keyTouched, setKeyTouched] = useState(false);

  useEffect(() => {
    setForm(initialValue);
    setKeyTouched(true);
  }, [initialValue]);

  const canSave = useMemo(() => {
    return Boolean(form.name.trim() && form.key.trim());
  }, [form.key, form.name]);

  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave({
          ...form,
          key: slugifyKey(form.key),
        });
      }}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Node editor</p>
          <h2 className={styles.title}>Edit node</h2>
          <p className={styles.copy}>
            This tab is for the core record only. Graph and relationship work live in their own tabs so this form stays
            clean.
          </p>
        </div>

        <div className={styles.actionRow}>
          <button type="submit" className={styles.primaryButton} disabled={!canSave || isSaving}>
            {isSaving ? "Saving…" : "Save node"}
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
                key: keyTouched ? current.key : slugifyKey(nextName),
              }));
            }}
            placeholder="Isabella"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Key</span>
          <input
            className={styles.input}
            value={form.key}
            onChange={(event) => {
              setKeyTouched(true);
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
                kind: event.target.value,
              }))
            }
          >
            {KIND_OPTIONS.map((option) => (
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
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
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
            placeholder="shrine, lantern, middletown"
          />
        </label>
      </div>

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
          placeholder="Short card summary for the node."
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

      {saveMessage ? <div className={styles.success}>{saveMessage}</div> : null}
    </form>
  );
}
