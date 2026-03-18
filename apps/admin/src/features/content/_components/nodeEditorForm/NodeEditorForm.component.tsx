"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NodeEditorForm.module.scss";

import RelationEditor from "../relationEditor/RelationEditor.component";
import type { NodeEditorParentOption } from "../nodeWorkspace/nodeWorkspace.types";

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
const LINKED_CONTENT_OPTIONS = ["combatant"] as const;
const MEDIA_ITEM_KIND_OPTIONS = ["image", "video"] as const;
const EMBED_KIND_OPTIONS = ["youtube", "vimeo", "audio", "other"] as const;

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

function createDraftId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export type NodeRelationDraft = {
  type: string;
  targetKey: string;
  label?: string;
  notes?: string;
};

export type NodeLinkedContentDraft = {
  id: string;
  type: (typeof LINKED_CONTENT_OPTIONS)[number];
  targetId: string;
  label: string;
};

export type NodeMediaGalleryDraft = {
  id: string;
  url: string;
  kind: (typeof MEDIA_ITEM_KIND_OPTIONS)[number];
  title: string;
  caption: string;
  alt: string;
};

export type NodeMediaEmbedDraft = {
  id: string;
  kind: (typeof EMBED_KIND_OPTIONS)[number];
  url: string;
  title: string;
  caption: string;
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
  linkedContent: NodeLinkedContentDraft[];
  meta: {
    media: {
      portraitUrl: string;
      bannerUrl: string;
      tokenUrl: string;
      gallery: NodeMediaGalleryDraft[];
      embeds: NodeMediaEmbedDraft[];
    };
    identity: {
      subtitle: string;
      epithet: string;
      aliases: string;
      pronunciation: string;
      title: string;
    };
    classification: {
      species: string;
      culture: string;
      occupation: string;
      affiliation: string;
      religion: string;
      region: string;
      settlement: string;
    };
    world: {
      regionLabel: string;
      coordX: string;
      coordY: string;
      era: string;
      timelineNote: string;
    };
    story: {
      hooks: string;
      rumors: string;
      secrets: string;
      quotes: string;
      gmNotes: string;
    };
  };
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
              setForm((current) => ({
                ...current,
                key: slugifyKey(event.target.value),
              }));
            }}
            placeholder="ilyra-fenwick"
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
          placeholder="frontier, council, shrine, lantern"
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

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Media</h3>
            <p className={styles.sectionCopy}>
              Portraits, banners, token art, gallery images, and video or audio embeds.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Portrait URL</span>
            <input
              className={styles.input}
              value={form.meta.media.portraitUrl}
              onChange={(event) => updateMeta("media", "portraitUrl", event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Banner URL</span>
            <input
              className={styles.input}
              value={form.meta.media.bannerUrl}
              onChange={(event) => updateMeta("media", "bannerUrl", event.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Token URL</span>
            <input
              className={styles.input}
              value={form.meta.media.tokenUrl}
              onChange={(event) => updateMeta("media", "tokenUrl", event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>

        <div className={styles.stack}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.subsectionTitle}>Gallery</h4>
            <button type="button" className={styles.secondaryButton} onClick={addGalleryItem}>
              Add gallery item
            </button>
          </div>

          {form.meta.media.gallery.length ? (
            form.meta.media.gallery.map((item) => (
              <div key={item.id} className={styles.rowCard}>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span className={styles.label}>URL</span>
                    <input
                      className={styles.input}
                      value={item.url}
                      onChange={(event) => updateGalleryItem(item.id, { url: event.target.value })}
                      placeholder="https://..."
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Kind</span>
                    <select
                      className={styles.select}
                      value={item.kind}
                      onChange={(event) =>
                        updateGalleryItem(item.id, {
                          kind: event.target.value as NodeMediaGalleryDraft["kind"],
                        })
                      }
                    >
                      {MEDIA_ITEM_KIND_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Title</span>
                    <input
                      className={styles.input}
                      value={item.title}
                      onChange={(event) => updateGalleryItem(item.id, { title: event.target.value })}
                      placeholder="Shrine portrait"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Alt text</span>
                    <input
                      className={styles.input}
                      value={item.alt}
                      onChange={(event) => updateGalleryItem(item.id, { alt: event.target.value })}
                      placeholder="Helpful image description"
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>Caption</span>
                  <textarea
                    className={styles.textareaShort}
                    value={item.caption}
                    onChange={(event) => updateGalleryItem(item.id, { caption: event.target.value })}
                    placeholder="Optional caption or scene note"
                  />
                </label>

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => removeGalleryItem(item.id)}>
                    Remove item
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.helper}>No gallery items yet.</p>
          )}
        </div>

        <div className={styles.stack}>
          <div className={styles.sectionHeader}>
            <h4 className={styles.subsectionTitle}>Embeds</h4>
            <button type="button" className={styles.secondaryButton} onClick={addEmbedItem}>
              Add embed
            </button>
          </div>

          {form.meta.media.embeds.length ? (
            form.meta.media.embeds.map((item) => (
              <div key={item.id} className={styles.rowCard}>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span className={styles.label}>URL</span>
                    <input
                      className={styles.input}
                      value={item.url}
                      onChange={(event) => updateEmbedItem(item.id, { url: event.target.value })}
                      placeholder="https://..."
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Kind</span>
                    <select
                      className={styles.select}
                      value={item.kind}
                      onChange={(event) =>
                        updateEmbedItem(item.id, {
                          kind: event.target.value as NodeMediaEmbedDraft["kind"],
                        })
                      }
                    >
                      {EMBED_KIND_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Title</span>
                    <input
                      className={styles.input}
                      value={item.title}
                      onChange={(event) => updateEmbedItem(item.id, { title: event.target.value })}
                      placeholder="Mood reel"
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>Caption</span>
                  <textarea
                    className={styles.textareaShort}
                    value={item.caption}
                    onChange={(event) => updateEmbedItem(item.id, { caption: event.target.value })}
                    placeholder="Optional context for the embed"
                  />
                </label>

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => removeEmbedItem(item.id)}>
                    Remove embed
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.helper}>No embeds yet.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Identity</h3>
            <p className={styles.sectionCopy}>
              Short structured facts that help this node read like a real world entry.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Subtitle</span>
            <input
              className={styles.input}
              value={form.meta.identity.subtitle}
              onChange={(event) => updateMeta("identity", "subtitle", event.target.value)}
              placeholder="Shrine Maiden of Everpine"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Epithet</span>
            <input
              className={styles.input}
              value={form.meta.identity.epithet}
              onChange={(event) => updateMeta("identity", "epithet", event.target.value)}
              placeholder="The Lantern's Quiet Flame"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Title</span>
            <input
              className={styles.input}
              value={form.meta.identity.title}
              onChange={(event) => updateMeta("identity", "title", event.target.value)}
              placeholder="Captain, Lord, Elder..."
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Pronunciation</span>
            <input
              className={styles.input}
              value={form.meta.identity.pronunciation}
              onChange={(event) => updateMeta("identity", "pronunciation", event.target.value)}
              placeholder="ill-EE-rah FEN-wick"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Aliases</span>
          <input
            className={styles.input}
            value={form.meta.identity.aliases}
            onChange={(event) => updateMeta("identity", "aliases", event.target.value)}
            placeholder="Lantern Daughter, Keeper of the East Shrine"
          />
          <span className={styles.helper}>Comma-separated.</span>
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Classification</h3>
            <p className={styles.sectionCopy}>Searchable world-facing facts. Useful now, and even more useful later.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Species</span>
            <input
              className={styles.input}
              value={form.meta.classification.species}
              onChange={(event) => updateMeta("classification", "species", event.target.value)}
              placeholder="Human"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Culture</span>
            <input
              className={styles.input}
              value={form.meta.classification.culture}
              onChange={(event) => updateMeta("classification", "culture", event.target.value)}
              placeholder="Everpine frontier"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Occupation</span>
            <input
              className={styles.input}
              value={form.meta.classification.occupation}
              onChange={(event) => updateMeta("classification", "occupation", event.target.value)}
              placeholder="Militia captain"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Region</span>
            <input
              className={styles.input}
              value={form.meta.classification.region}
              onChange={(event) => updateMeta("classification", "region", event.target.value)}
              placeholder="The Northwood March"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Settlement</span>
            <input
              className={styles.input}
              value={form.meta.classification.settlement}
              onChange={(event) => updateMeta("classification", "settlement", event.target.value)}
              placeholder="Everpine"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Affiliation</span>
          <input
            className={styles.input}
            value={form.meta.classification.affiliation}
            onChange={(event) => updateMeta("classification", "affiliation", event.target.value)}
            placeholder="Everpine Council, Militia of Everpine"
          />
          <span className={styles.helper}>Comma-separated.</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Religion</span>
          <input
            className={styles.input}
            value={form.meta.classification.religion}
            onChange={(event) => updateMeta("classification", "religion", event.target.value)}
            placeholder="Followers of the Lantern"
          />
          <span className={styles.helper}>Comma-separated.</span>
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>World</h3>
            <p className={styles.sectionCopy}>Mapping and timeline context without burying it in the body text.</p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Region label</span>
            <input
              className={styles.input}
              value={form.meta.world.regionLabel}
              onChange={(event) => updateMeta("world", "regionLabel", event.target.value)}
              placeholder="Eastern Ward"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Era</span>
            <input
              className={styles.input}
              value={form.meta.world.era}
              onChange={(event) => updateMeta("world", "era", event.target.value)}
              placeholder="Age of Lanterns"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Map coordinate X</span>
            <input
              className={styles.input}
              value={form.meta.world.coordX}
              onChange={(event) => updateMeta("world", "coordX", event.target.value)}
              placeholder="128"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Map coordinate Y</span>
            <input
              className={styles.input}
              value={form.meta.world.coordY}
              onChange={(event) => updateMeta("world", "coordY", event.target.value)}
              placeholder="64"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Timeline note</span>
          <textarea
            className={styles.textareaShort}
            value={form.meta.world.timelineNote}
            onChange={(event) => updateMeta("world", "timelineNote", event.target.value)}
            placeholder="Useful timeline context, reign period, or campaign-era note."
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Story aids</h3>
            <p className={styles.sectionCopy}>
              Fast table-facing material that should not be buried in one long lore essay.
            </p>
          </div>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>Hooks</span>
            <textarea
              className={styles.textareaShort}
              value={form.meta.story.hooks}
              onChange={(event) => updateMeta("story", "hooks", event.target.value)}
              placeholder={"One per line\nEscort the shrine maiden\nRecover the lost lantern"}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Rumors</span>
            <textarea
              className={styles.textareaShort}
              value={form.meta.story.rumors}
              onChange={(event) => updateMeta("story", "rumors", event.target.value)}
              placeholder={"One per line\nShe speaks with the dead\nThe shrine hides a relic"}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Secrets</span>
            <textarea
              className={styles.textareaShort}
              value={form.meta.story.secrets}
              onChange={(event) => updateMeta("story", "secrets", event.target.value)}
              placeholder={"One per line\nKnows the council is divided"}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Quotes</span>
            <textarea
              className={styles.textareaShort}
              value={form.meta.story.quotes}
              onChange={(event) => updateMeta("story", "quotes", event.target.value)}
              placeholder={"One per line\nThe lantern does not judge. It reveals."}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>GM notes</span>
          <textarea
            className={styles.textareaShort}
            value={form.meta.story.gmNotes}
            onChange={(event) => updateMeta("story", "gmNotes", event.target.value)}
            placeholder={"One per line\nSoft-spoken until faith is challenged"}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Linked content</h3>
            <p className={styles.sectionCopy}>Cross-system references. Start small: combatants first.</p>
          </div>

          <button type="button" className={styles.secondaryButton} onClick={addLinkedContent}>
            Add linked content
          </button>
        </div>

        {form.linkedContent.length ? (
          <div className={styles.stack}>
            {form.linkedContent.map((item) => (
              <div key={item.id} className={styles.rowCard}>
                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span className={styles.label}>Type</span>
                    <select
                      className={styles.select}
                      value={item.type}
                      onChange={(event) =>
                        updateLinkedContent(item.id, {
                          type: event.target.value as NodeLinkedContentDraft["type"],
                        })
                      }
                    >
                      {LINKED_CONTENT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Target ID</span>
                    <input
                      className={styles.input}
                      value={item.targetId}
                      onChange={(event) => updateLinkedContent(item.id, { targetId: event.target.value })}
                      placeholder="combatant id"
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Label</span>
                    <input
                      className={styles.input}
                      value={item.label}
                      onChange={(event) => updateLinkedContent(item.id, { label: event.target.value })}
                      placeholder="Captain Varrick combat profile"
                    />
                  </label>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => removeLinkedContent(item.id)}>
                    Remove link
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.helper}>No linked content yet.</p>
        )}
      </section>

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
          <strong className={styles.metaValue}>{mode}</strong>
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
