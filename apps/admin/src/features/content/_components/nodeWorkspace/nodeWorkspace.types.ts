export type WorkspaceTab = "editor" | "graph" | "relationships";

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

  // Flexible on purpose. Use whichever shape your backend now returns.
  targetNode?: LoreRelationTargetRef | null;
  target?: LoreRelationTargetRef | null;

  // Optional future-proofing if you later return incoming relations too.
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
