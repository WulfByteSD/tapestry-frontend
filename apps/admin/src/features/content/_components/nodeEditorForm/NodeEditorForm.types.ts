export const LORE_KIND_OPTIONS = [
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

export const STATUS_OPTIONS = ["draft", "published", "archived"] as const;
export const LINKED_CONTENT_OPTIONS = ["combatant"] as const;
export const MEDIA_ITEM_KIND_OPTIONS = ["image", "video"] as const;
export const EMBED_KIND_OPTIONS = ["youtube", "vimeo", "audio", "other"] as const;

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
