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

export type LoreRelation = {
  type: string;
  targetId?: string;
  targetKey?: string;
  label?: string;
  notes?: string;
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
