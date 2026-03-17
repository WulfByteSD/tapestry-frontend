export type LoreEditorMode = "create-root" | "create-child" | "edit";

export type LoreParentOption = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  depth: number;
};

export type LoreNodeSummary = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  status: "draft" | "published" | "archived";
  parentId?: string | null;
};

export type LoreEditorProps = {
  selectedSettingKey: string | null;
  selectedNodeKey: string | null;
  selectedNodeSummary?: LoreNodeSummary | null;
  relationTargets: LoreParentOption[];
  mode: LoreEditorMode;
  parentOptions: LoreParentOption[];
  onSaved: (nextKey: string) => void;
  onCancelCreate: () => void;
  onBackToBrowser: () => void;
};

export type LoreNodePayload = {
  relations: any;
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
};
