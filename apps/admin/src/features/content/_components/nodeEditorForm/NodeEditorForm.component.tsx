"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NodeEditorForm.module.scss";

import RelationEditor from "../relationEditor/RelationEditor.component";
import type { NodeEditorParentOption } from "../nodeWorkspace/nodeWorkspace.types";
import {
  type NodeEditorFormValue,
  type NodeEditorFormMode,
  type NodeLinkedContentDraft,
  type NodeMediaGalleryDraft,
  type NodeMediaEmbedDraft,
  type LinkedContentOption,
  type SearchLinkedContentParams,
} from "./NodeEditorForm.types";
import { slugifyKey, createDraftId } from "./NodeEditorForm.helpers";

import FormHeader from "./sections/FormHeader.component";
import CoreFields from "./sections/CoreFields.component";
import ContentFields from "./sections/ContentFields.component";
import MediaSection from "./sections/MediaSection.component";
import IdentitySection from "./sections/IdentitySection.component";
import ClassificationSection from "./sections/ClassificationSection.component";
import WorldSection from "./sections/WorldSection.component";
import StorySection from "./sections/StorySection.component";
import LinkedContentSection from "./sections/LinkedContentSection.component";
import MetaStrip from "./sections/MetaStrip.component";

type NodeEditorFormProps = {
  initialValue: NodeEditorFormValue;
  parentOptions: NodeEditorParentOption[];
  relationTargets: NodeEditorParentOption[];
  isSaving?: boolean;
  saveMessage?: string | null;
  mode?: NodeEditorFormMode;
  onSave: (value: NodeEditorFormValue) => Promise<void> | void;
  onSearchLinkedContent?: (params: SearchLinkedContentParams) => Promise<LinkedContentOption[]>;
};

export default function NodeEditorForm({
  initialValue,
  parentOptions,
  relationTargets,
  mode = "edit",
  isSaving = false,
  saveMessage,
  onSave,
  onSearchLinkedContent,
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
        : "This is the full lore editor again — parent, tags, body, relationships, media, and structured world facts — just moved onto the dedicated node page where it belongs.";

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

  const updateForm = (updates: Partial<NodeEditorFormValue>) => {
    setForm((current) => ({ ...current, ...updates }));
  };

  const updateMeta = <
    TSection extends keyof NodeEditorFormValue["meta"],
    TKey extends keyof NodeEditorFormValue["meta"][TSection],
  >(
    section: TSection,
    key: TKey,
    value: NodeEditorFormValue["meta"][TSection][TKey],
  ) => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        [section]: {
          ...current.meta[section],
          [key]: value,
        },
      },
    }));
  };

  const addGalleryItem = () => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        media: {
          ...current.meta.media,
          gallery: [
            ...current.meta.media.gallery,
            {
              id: createDraftId("gallery"),
              url: "",
              kind: "image",
              title: "",
              caption: "",
              alt: "",
            },
          ],
        },
      },
    }));
  };

  const updateGalleryItem = (itemId: string, patch: Partial<NodeMediaGalleryDraft>) => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        media: {
          ...current.meta.media,
          gallery: current.meta.media.gallery.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
        },
      },
    }));
  };

  const removeGalleryItem = (itemId: string) => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        media: {
          ...current.meta.media,
          gallery: current.meta.media.gallery.filter((item) => item.id !== itemId),
        },
      },
    }));
  };

  const addEmbedItem = () => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        media: {
          ...current.meta.media,
          embeds: [
            ...current.meta.media.embeds,
            {
              id: createDraftId("embed"),
              kind: "other",
              url: "",
              title: "",
              caption: "",
            },
          ],
        },
      },
    }));
  };

  const updateEmbedItem = (itemId: string, patch: Partial<NodeMediaEmbedDraft>) => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        media: {
          ...current.meta.media,
          embeds: current.meta.media.embeds.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
        },
      },
    }));
  };

  const removeEmbedItem = (itemId: string) => {
    setForm((current) => ({
      ...current,
      meta: {
        ...current.meta,
        media: {
          ...current.meta.media,
          embeds: current.meta.media.embeds.filter((item) => item.id !== itemId),
        },
      },
    }));
  };

  const addLinkedContent = () => {
    setForm((current) => ({
      ...current,
      linkedContent: [
        ...current.linkedContent,
        {
          id: createDraftId("linked"),
          type: "combatant",
          targetId: "",
          targetKey: "",
          targetName: "",
          label: "",
        },
      ],
    }));
  };

  const updateLinkedContent = (itemId: string, patch: Partial<NodeLinkedContentDraft>) => {
    setForm((current) => ({
      ...current,
      linkedContent: current.linkedContent.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }));
  };

  const removeLinkedContent = (itemId: string) => {
    setForm((current) => ({
      ...current,
      linkedContent: current.linkedContent.filter((item) => item.id !== itemId),
    }));
  };

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
      <FormHeader
        formTitle={formTitle}
        formCopy={formCopy}
        mode={mode}
        submitLabel={submitLabel}
        canSave={canSave}
        isSaving={isSaving}
      />

      <CoreFields form={form} parentOptions={parentOptions} keyTouchedRef={keyTouchedRef} onUpdate={updateForm} />

      <ContentFields form={form} onUpdate={updateForm} />

      <MediaSection
        media={form.meta.media}
        onUpdateMeta={updateMeta}
        onAddGalleryItem={addGalleryItem}
        onUpdateGalleryItem={updateGalleryItem}
        onRemoveGalleryItem={removeGalleryItem}
        onAddEmbedItem={addEmbedItem}
        onUpdateEmbedItem={updateEmbedItem}
        onRemoveEmbedItem={removeEmbedItem}
      />

      <IdentitySection identity={form.meta.identity} onUpdateMeta={updateMeta} />
      <ClassificationSection classification={form.meta.classification} onUpdateMeta={updateMeta} />
      <WorldSection world={form.meta.world} onUpdateMeta={updateMeta} />
      <StorySection story={form.meta.story} onUpdateMeta={updateMeta} />

      <LinkedContentSection
        settingKey={form.settingKey}
        linkedContent={form.linkedContent}
        onAddLinkedContent={addLinkedContent}
        onUpdateLinkedContent={updateLinkedContent}
        onRemoveLinkedContent={removeLinkedContent}
        onSearchLinkedContent={onSearchLinkedContent}
      />

      <MetaStrip settingKey={form.settingKey} parentName={parentName} mode={mode} />

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
