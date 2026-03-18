export type WorkspaceTab = "editor" | "graph" | "relationships";

export type LinkedContentRef = {
  type: "combatant";
  targetId: string;
  label?: string;
};

export type LoreNodeMediaItem = {
  id?: string;
  url: string;
  kind: "image" | "video";
  title?: string;
  caption?: string;
  alt?: string;
};

export type LoreNodeEmbed = {
  id?: string;
  kind: "youtube" | "vimeo" | "audio" | "other";
  url: string;
  title?: string;
  caption?: string;
};

export type LoreNodeMeta = {
  media?: {
    portraitUrl?: string;
    bannerUrl?: string;
    tokenUrl?: string;
    gallery?: LoreNodeMediaItem[];
    embeds?: LoreNodeEmbed[];
  };
  identity?: {
    subtitle?: string;
    epithet?: string;
    aliases?: string[];
    pronunciation?: string;
    title?: string;
  };
  classification?: {
    species?: string;
    culture?: string;
    occupation?: string;
    affiliation?: string[];
    religion?: string[];
    region?: string;
    settlement?: string;
  };
  world?: {
    regionLabel?: string;
    coordinates?: {
      x?: number | null;
      y?: number | null;
    };
    era?: string;
    timelineNote?: string;
  };
  story?: {
    hooks?: string[];
    rumors?: string[];
    secrets?: string[];
    quotes?: string[];
    gmNotes?: string[];
  };
};

export type LoreNodeDetail = {
  _id: string;
  settingKey: string;
  key: string;
  name: string;
  kind: string;
  status: "draft" | "published" | "archived";
  parentId?: string | null;
  sortOrder?: number;
  tags?: string[];
  summary?: string;
  body?: string;
  relations?: LoreRelation[];
  linkedContent?: LinkedContentRef[];
  meta?: LoreNodeMeta;
  createdAt?: string;
  updatedAt?: string;
};

export type LoreRelationTargetRef = {
  _id: string;
  key: string;
  name: string;
  kind?: string;
  status?: "draft" | "published" | "archived";
};

export type LoreRelation = {
  type: string;
  targetId?: string;
  targetKey?: string;
  label?: string;
  notes?: string;
  targetNode?: LoreRelationTargetRef | null;
  target?: LoreRelationTargetRef | null;
  direction?: "outgoing" | "incoming";
};

export type LoreTreeNode = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  status: "draft" | "published" | "archived";
  depth: number;
  parentId?: string | null;
  children?: LoreTreeNode[];
};

export type NodeEditorParentOption = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  depth: number;
};

export type NodeWorkspaceProps = {
  nodeId: string;
};

export type FocusedLoreNodeRef = {
  _id: string;
  key: string;
  name: string;
  kind?: string;
  status?: "draft" | "published" | "archived";
  relations?: LoreRelation[];
};

export type FocusedLoreTreeNode = {
  _id: string;
  settingKey: string;
  key: string;
  name: string;
  kind: string;
  status: "draft" | "published" | "archived";
  parentId?: string | null;
  ancestorIds?: string[];
  depth: number;
  sortOrder?: number;
  summary?: string;
  childCount?: number;
  hasChildren?: boolean;
  isRoot?: boolean;
  isFocus?: boolean;
  isLineage?: boolean;
  children?: FocusedLoreTreeNode[];
};

export type FocusedLoreContext = {
  focus: FocusedLoreNodeRef;
  lineage: FocusedLoreNodeRef[];
  tree: FocusedLoreTreeNode | null;
  metadata?: {
    descendantDepth: number;
    rootId: string;
    focusId: string;
  };
};