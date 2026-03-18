import { NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.types";
import type { LoreNodeDetail, LoreTreeNode, NodeEditorParentOption } from "./nodeWorkspace.types";

function toCommaInput(values?: string[]) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function toLineInput(values?: string[]) {
  return Array.isArray(values) ? values.join("\n") : "";
}

function toCommaArray(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toLineArray(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function createDraftId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyNodeEditorFormValue(args: {
  settingKey: string;
  parentId?: string | null;
}): NodeEditorFormValue {
  return {
    settingKey: args.settingKey,
    name: "",
    key: "",
    kind: "other",
    status: "draft",
    parentId: args.parentId ?? "",
    sortOrder: "0",
    tags: "",
    summary: "",
    body: "",
    relations: [],
    linkedContent: [],
    meta: {
      media: {
        portraitUrl: "",
        bannerUrl: "",
        tokenUrl: "",
        gallery: [],
        embeds: [],
      },
      identity: {
        subtitle: "",
        epithet: "",
        aliases: "",
        pronunciation: "",
        title: "",
      },
      classification: {
        species: "",
        culture: "",
        occupation: "",
        affiliation: "",
        religion: "",
        region: "",
        settlement: "",
      },
      world: {
        regionLabel: "",
        coordX: "",
        coordY: "",
        era: "",
        timelineNote: "",
      },
      story: {
        hooks: "",
        rumors: "",
        secrets: "",
        quotes: "",
        gmNotes: "",
      },
    },
  };
}

export function toFormValue(node: LoreNodeDetail): NodeEditorFormValue {
  const empty = createEmptyNodeEditorFormValue({
    settingKey: node.settingKey,
    parentId: node.parentId ?? "",
  });

  return {
    ...empty,
    settingKey: node.settingKey,
    name: node.name ?? "",
    key: node.key ?? "",
    kind: (node.kind as NodeEditorFormValue["kind"]) ?? "other",
    status: node.status ?? "draft",
    parentId: node.parentId ?? "",
    sortOrder: String(node.sortOrder ?? 0),
    tags: Array.isArray(node.tags) ? node.tags.join(", ") : "",
    summary: node.summary ?? "",
    body: node.body ?? "",
    relations: Array.isArray(node.relations)
      ? node.relations.map((relation) => ({
          type: relation.type,
          targetKey: relation.targetKey || "",
          label: relation.label || "",
          notes: relation.notes || "",
        }))
      : [],
    linkedContent: Array.isArray(node.linkedContent)
      ? node.linkedContent.map((item, index) => ({
          id: createDraftId(`linked-${index}`),
          type: item.type ?? "combatant",
          targetId: item.targetId ?? "",
          label: item.label ?? "",
        }))
      : [],
    meta: {
      media: {
        portraitUrl: node.meta?.media?.portraitUrl ?? "",
        bannerUrl: node.meta?.media?.bannerUrl ?? "",
        tokenUrl: node.meta?.media?.tokenUrl ?? "",
        gallery: Array.isArray(node.meta?.media?.gallery)
          ? node.meta!.media!.gallery!.map((item, index) => ({
              id: item.id ?? createDraftId(`gallery-${index}`),
              url: item.url ?? "",
              kind: item.kind ?? "image",
              title: item.title ?? "",
              caption: item.caption ?? "",
              alt: item.alt ?? "",
            }))
          : [],
        embeds: Array.isArray(node.meta?.media?.embeds)
          ? node.meta!.media!.embeds!.map((item, index) => ({
              id: item.id ?? createDraftId(`embed-${index}`),
              kind: item.kind ?? "other",
              url: item.url ?? "",
              title: item.title ?? "",
              caption: item.caption ?? "",
            }))
          : [],
      },
      identity: {
        subtitle: node.meta?.identity?.subtitle ?? "",
        epithet: node.meta?.identity?.epithet ?? "",
        aliases: toCommaInput(node.meta?.identity?.aliases),
        pronunciation: node.meta?.identity?.pronunciation ?? "",
        title: node.meta?.identity?.title ?? "",
      },
      classification: {
        species: node.meta?.classification?.species ?? "",
        culture: node.meta?.classification?.culture ?? "",
        occupation: node.meta?.classification?.occupation ?? "",
        affiliation: toCommaInput(node.meta?.classification?.affiliation),
        religion: toCommaInput(node.meta?.classification?.religion),
        region: node.meta?.classification?.region ?? "",
        settlement: node.meta?.classification?.settlement ?? "",
      },
      world: {
        regionLabel: node.meta?.world?.regionLabel ?? "",
        coordX:
          node.meta?.world?.coordinates?.x === null ||
          node.meta?.world?.coordinates?.x === undefined
            ? ""
            : String(node.meta.world.coordinates.x),
        coordY:
          node.meta?.world?.coordinates?.y === null ||
          node.meta?.world?.coordinates?.y === undefined
            ? ""
            : String(node.meta.world.coordinates.y),
        era: node.meta?.world?.era ?? "",
        timelineNote: node.meta?.world?.timelineNote ?? "",
      },
      story: {
        hooks: toLineInput(node.meta?.story?.hooks),
        rumors: toLineInput(node.meta?.story?.rumors),
        secrets: toLineInput(node.meta?.story?.secrets),
        quotes: toLineInput(node.meta?.story?.quotes),
        gmNotes: toLineInput(node.meta?.story?.gmNotes),
      },
    },
  };
}

export function toUpdatePayload(form: NodeEditorFormValue) {
  return {
    name: form.name.trim(),
    key: form.key.trim().toLowerCase(),
    kind: form.kind,
    status: form.status,
    parentId: form.parentId || null,
    sortOrder: Number(form.sortOrder || 0),
    tags: form.tags
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    summary: form.summary.trim(),
    body: form.body.trim(),
    relations: form.relations
      .map((relation) => ({
        type: relation.type,
        targetKey: relation.targetKey.trim(),
        label: relation.label?.trim() || "",
        notes: relation.notes?.trim() || "",
      }))
      .filter((relation) => relation.targetKey),
    linkedContent: form.linkedContent
      .map((item) => ({
        type: item.type,
        targetId: item.targetId.trim(),
        label: item.label.trim(),
      }))
      .filter((item) => item.targetId),
    meta: {
      media: {
        portraitUrl: form.meta.media.portraitUrl.trim(),
        bannerUrl: form.meta.media.bannerUrl.trim(),
        tokenUrl: form.meta.media.tokenUrl.trim(),
        gallery: form.meta.media.gallery
          .map((item) => ({
            id: item.id,
            url: item.url.trim(),
            kind: item.kind,
            title: item.title.trim(),
            caption: item.caption.trim(),
            alt: item.alt.trim(),
          }))
          .filter((item) => item.url),
        embeds: form.meta.media.embeds
          .map((item) => ({
            id: item.id,
            kind: item.kind,
            url: item.url.trim(),
            title: item.title.trim(),
            caption: item.caption.trim(),
          }))
          .filter((item) => item.url),
      },
      identity: {
        subtitle: form.meta.identity.subtitle.trim(),
        epithet: form.meta.identity.epithet.trim(),
        aliases: toCommaArray(form.meta.identity.aliases),
        pronunciation: form.meta.identity.pronunciation.trim(),
        title: form.meta.identity.title.trim(),
      },
      classification: {
        species: form.meta.classification.species.trim(),
        culture: form.meta.classification.culture.trim(),
        occupation: form.meta.classification.occupation.trim(),
        affiliation: toCommaArray(form.meta.classification.affiliation),
        religion: toCommaArray(form.meta.classification.religion),
        region: form.meta.classification.region.trim(),
        settlement: form.meta.classification.settlement.trim(),
      },
      world: {
        regionLabel: form.meta.world.regionLabel.trim(),
        coordinates: {
          x: form.meta.world.coordX === "" ? null : Number(form.meta.world.coordX),
          y: form.meta.world.coordY === "" ? null : Number(form.meta.world.coordY),
        },
        era: form.meta.world.era.trim(),
        timelineNote: form.meta.world.timelineNote.trim(),
      },
      story: {
        hooks: toLineArray(form.meta.story.hooks),
        rumors: toLineArray(form.meta.story.rumors),
        secrets: toLineArray(form.meta.story.secrets),
        quotes: toLineArray(form.meta.story.quotes),
        gmNotes: toLineArray(form.meta.story.gmNotes),
      },
    },
  };
}

export function flattenTree(
  nodes: LoreTreeNode[],
  bucket: NodeEditorParentOption[] = [],
): NodeEditorParentOption[] {
  for (const node of nodes) {
    bucket.push({
      _id: node._id,
      key: node.key,
      name: node.name,
      kind: node.kind,
      depth: node.depth,
    });

    if (node.children?.length) {
      flattenTree(node.children, bucket);
    }
  }

  return bucket;
}

export function findNodeById(nodes: LoreTreeNode[], id: string): LoreTreeNode | null {
  for (const node of nodes) {
    if (node._id === id) return node;

    if (node.children?.length) {
      const nested = findNodeById(node.children, id);
      if (nested) return nested;
    }
  }

  return null;
}

export function collectDescendantIds(
  node: LoreTreeNode | null,
  bucket = new Set<string>(),
) {
  if (!node?.children?.length) return bucket;

  for (const child of node.children) {
    bucket.add(child._id);
    collectDescendantIds(child, bucket);
  }

  return bucket;
}