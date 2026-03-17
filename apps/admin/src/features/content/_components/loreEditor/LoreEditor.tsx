"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import styles from "./LoreEditor.module.scss";
import RelationEditor from "../relationEditor/RelationEditor.component";
import { LoreRelationDraft } from "../../_hooks/useContentStudio";
import {
  LORE_KIND_OPTIONS,
  STATUS_OPTIONS,
  slugifyKey,
  formatParentLabel,
  toTagsInput,
  toTagArray,
} from "./lore.helper";
import type { LoreEditorMode, LoreEditorProps, LoreNodePayload, LoreNodeSummary, LoreParentOption } from "./lore.types";

export default function LoreEditor({
  selectedSettingKey,
  selectedNodeKey,
  selectedNodeSummary,
  relationTargets,
  mode,
  parentOptions,
  onSaved,
  onCancelCreate,
  onBackToBrowser,
}: LoreEditorProps) {
  const queryClient = useQueryClient();
  const keyTouchedRef = useRef(false);

  const isEditMode = mode === "edit";
  const isCreateChildMode = mode === "create-child";
  const isCreateRootMode = mode === "create-root";

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [kind, setKind] = useState<(typeof LORE_KIND_OPTIONS)[number]>("other");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("draft");
  const [parentId, setParentId] = useState<string>("");
  const [sortOrder, setSortOrder] = useState("0");
  const [tagsInput, setTagsInput] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [draftRelations, setDraftRelations] = useState<LoreRelationDraft[]>([]);

  const detailQuery = useQuery({
    queryKey: ["admin-content", "lore-detail", selectedSettingKey, selectedNodeKey],
    enabled: Boolean(selectedSettingKey && selectedNodeKey && isEditMode),
    queryFn: async () => {
      const response = await api.get(
        `/game/content/lore/by-key/${encodeURIComponent(
          selectedSettingKey as string,
        )}/${encodeURIComponent(selectedNodeKey as string)}`,
      );

      return (response.data?.payload ?? null) as LoreNodePayload | null;
    },
  });

  const currentNode = useMemo(() => {
    if (isEditMode) {
      return detailQuery.data ?? null;
    }

    return selectedNodeSummary ?? null;
  }, [detailQuery.data, isEditMode, selectedNodeSummary]);

  useEffect(() => {
    setFormError(null);

    if (!selectedSettingKey) {
      setName("");
      setKey("");
      setKind("other");
      setStatus("draft");
      setParentId("");
      setSortOrder("0");
      setDraftRelations([]);
      setTagsInput("");
      setSummary("");
      setBody("");
      keyTouchedRef.current = false;
      return;
    }

    if (isEditMode && detailQuery.data) {
      const payload = detailQuery.data;

      setName(payload.name ?? "");
      setKey(payload.key ?? "");
      setKind((payload.kind as (typeof LORE_KIND_OPTIONS)[number]) ?? "other");
      setStatus((payload.status as (typeof STATUS_OPTIONS)[number]) ?? "draft");
      setParentId(payload.parentId ?? "");
      setSortOrder(String(payload.sortOrder ?? 0));
      setTagsInput(toTagsInput(payload.tags));
      setDraftRelations(
        Array.isArray(payload.relations)
          ? payload.relations.map((relation) => ({
              type: relation.type,
              targetKey: relation.targetKey || "",
              label: relation.label || "",
              notes: relation.notes || "",
            }))
          : [],
      );
      setSummary(payload.summary ?? "");
      setBody(payload.body ?? "");
      keyTouchedRef.current = true;
      return;
    }

    if (isCreateChildMode && selectedNodeSummary) {
      setName("");
      setKey("");
      setKind("other");
      setStatus("draft");
      setParentId(selectedNodeSummary._id);
      setSortOrder("0");
      setTagsInput("");
      setDraftRelations([]);
      setSummary("");
      setBody("");
      keyTouchedRef.current = false;
      return;
    }

    if (isCreateRootMode) {
      setName("");
      setKey("");
      setKind("other");
      setStatus("draft");
      setParentId("");
      setSortOrder("0");
      setDraftRelations([]);
      setTagsInput("");
      setSummary("");
      setBody("");
      keyTouchedRef.current = false;
    }
  }, [detailQuery.data, isCreateChildMode, isCreateRootMode, isEditMode, selectedNodeSummary, selectedSettingKey]);

  useEffect(() => {
    if (isEditMode || keyTouchedRef.current) return;
    setKey(slugifyKey(name));
  }, [isEditMode, name]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSettingKey) {
        throw new Error("A setting must be selected before saving lore.");
      }

      const trimmedName = name.trim();
      const trimmedKey = key.trim();

      if (!trimmedName) {
        throw new Error("Lore nodes need a name.");
      }

      if (!trimmedKey) {
        throw new Error("Lore nodes need a key.");
      }

      const payload = {
        settingKey: selectedSettingKey,
        name: trimmedName,
        key: trimmedKey,
        kind,
        status,
        parentId: parentId || null,
        sortOrder: Number(sortOrder || 0),
        tags: toTagArray(tagsInput),
        summary: summary.trim(),
        body: body.trim(),
        relations: draftRelations
          .map((relation) => ({
            type: relation.type,
            targetKey: relation.targetKey.trim(),
            label: relation.label?.trim() || "",
            notes: relation.notes?.trim() || "",
          }))
          .filter((relation) => relation.targetKey),
      };

      if (isEditMode && currentNode?._id) {
        const response = await api.put(`/game/content/lore/${currentNode._id}`, payload);
        return (response.data?.payload ?? response.data) as LoreNodePayload;
      }

      const response = await api.post("/game/content/lore", payload);
      return (response.data?.payload ?? response.data) as LoreNodePayload;
    },
    onSuccess: async (savedNode) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-content", "lore-tree"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-content", "lore-detail"] }),
      ]);

      onSaved(savedNode.key);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Lore save failed.";
      setFormError(message);
    },
  });

  const modeLabel = isEditMode ? "Edit lore node" : isCreateChildMode ? "Create child node" : "Create root node";

  const modeCopy = isEditMode
    ? "Adjust the selected node’s content, hierarchy, and publishing state."
    : isCreateChildMode
      ? "This new node will be nested under the selected parent."
      : "Create a new top-level lore node for the current setting.";

  const parentName = parentOptions.find((option) => option._id === parentId)?.name ?? null;

  return (
    <section className={styles.editor}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.eyebrow}>Lore authoring</p>
          <h2 className={styles.title}>{modeLabel}</h2>
          <p className={styles.copy}>{modeCopy}</p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostButton} onClick={onBackToBrowser}>
            Back to node tree
          </button>

          {!isEditMode ? (
            <button type="button" className={styles.ghostButton} onClick={onCancelCreate}>
              Cancel create
            </button>
          ) : null}
        </div>
      </div>

      {!selectedSettingKey ? (
        <div className={styles.notice}>Pick a setting first. Lore without a setting is just fog with paperwork.</div>
      ) : isEditMode && detailQuery.isLoading ? (
        <div className={styles.notice}>Loading selected lore node…</div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            setFormError(null);
            saveMutation.mutate();
          }}
        >
          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>Name</span>
              <input
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Everpine, The Gilded Watch, Ser Rowan, etc."
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Key</span>
              <input
                className={styles.input}
                value={key}
                onChange={(event) => {
                  keyTouchedRef.current = true;
                  setKey(slugifyKey(event.target.value));
                }}
                placeholder="everpine"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Kind</span>
              <select
                className={styles.select}
                value={kind}
                onChange={(event) => setKind(event.target.value as (typeof LORE_KIND_OPTIONS)[number])}
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
                value={status}
                onChange={(event) => setStatus(event.target.value as (typeof STATUS_OPTIONS)[number])}
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
              <select className={styles.select} value={parentId} onChange={(event) => setParentId(event.target.value)}>
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
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Tags</span>
            <input
              className={styles.input}
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="frontier, village, militia, northern-reach"
            />
            <span className={styles.helper}>Comma-separated. Keep them boring and useful.</span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Summary</span>
            <textarea
              className={styles.textareaShort}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Short admin-facing summary for cards and previews."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Body</span>
            <textarea
              className={styles.textarea}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Full lore entry..."
            />
          </label>

          <div className={styles.metaStrip}>
            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Setting</span>
              <strong className={styles.metaValue}>{selectedSettingKey}</strong>
            </div>

            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Parent</span>
              <strong className={styles.metaValue}>{parentName ?? "Root"}</strong>
            </div>

            <div className={styles.metaCard}>
              <span className={styles.metaLabel}>Mode</span>
              <strong className={styles.metaValue}>{mode}</strong>
            </div>
          </div>

          {formError ? <div className={styles.error}>{formError}</div> : null}
          <RelationEditor
            value={draftRelations}
            onChange={setDraftRelations as any}
            targets={relationTargets}
            disabled={!selectedSettingKey || saveMutation.isPending}
          />
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={saveMutation.isPending || (isEditMode && detailQuery.isLoading)}
            >
              {saveMutation.isPending ? "Saving…" : isEditMode ? "Save changes" : "Create lore node"}
            </button>

            {!isEditMode ? (
              <button type="button" className={styles.ghostButton} onClick={onCancelCreate}>
                Back to edit mode
              </button>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
