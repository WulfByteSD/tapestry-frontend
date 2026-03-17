"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@tapestry/api-client";
import { api } from "@/lib/api";

export type StudioContentType = "settings" | "lore" | "items" | "abilities" | "skills";

export type LoreStatus = "draft" | "published" | "archived";
export type LoreEditorMode = "create-root" | "create-child" | "edit";
export type StudioViewMode = "browser" | "editor";

export type StudioSettingSummary = {
  _id: string;
  key: string;
  name: string;
  description?: string;
  modules?: {
    items?: boolean;
    lore?: boolean;
    maps?: boolean;
    magic?: boolean;
  };
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
  status: LoreStatus;
  depth: number;
  parentId?: string | null;
  childCount?: number;
  hasChildren?: boolean;
  children?: LoreTreeNode[];
  relations?: LoreRelation[];
  summary?: string;
};

export type LoreNodeSummary = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  status: LoreStatus;
  parentId?: string | null;
};

export type LoreParentOption = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  depth: number;
};

export type LoreRelationType =
  | "located_in"
  | "member_of"
  | "rules"
  | "serves"
  | "allied_with"
  | "enemy_of"
  | "related_to"
  | "appears_in"
  | "originates_from";

export type LoreRelationDraft = {
  type: LoreRelationType;
  targetKey: string;
  label?: string;
  notes?: string;
};

function countLoreNodes(nodes: LoreTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countLoreNodes(node.children ?? []), 0);
}

function flattenTree(nodes: LoreTreeNode[], bucket: LoreParentOption[] = []): LoreParentOption[] {
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

function findNodeByKey(nodes: LoreTreeNode[], targetKey: string | null): LoreTreeNode | null {
  if (!targetKey) return null;

  for (const node of nodes) {
    if (node.key === targetKey) {
      return node;
    }

    if (node.children?.length) {
      const nested = findNodeByKey(node.children, targetKey);
      if (nested) return nested;
    }
  }

  return null;
}

function collectDescendantIds(node: LoreTreeNode | null, bucket = new Set<string>()) {
  if (!node?.children?.length) return bucket;

  for (const child of node.children) {
    bucket.add(child._id);
    collectDescendantIds(child, bucket);
  }

  return bucket;
}

export function useContentStudio() {
  const [activeType, setActiveType] = useState<StudioContentType>("lore");
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const [selectedLoreKey, setSelectedLoreKey] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<LoreEditorMode>("create-root");
  const [viewMode, setViewMode] = useState<StudioViewMode>("browser");

  function openEditorForNode(node: LoreTreeNode) {
    setSelectedLoreKey(node.key);
    setEditorMode("edit");
    setViewMode("editor");
  }

  function goBackToBrowser() {
    setViewMode("browser");
  }

  const settingsQuery = useQuery({
    queryKey: ["admin-content", "settings"],
    queryFn: async () => {
      const response = await getSettings(api, {
        pageNumber: 1,
        pageLimit: 100,
        sortOptions: "name",
      });

      return (response.payload ?? []) as StudioSettingSummary[];
    },
  });

  const settings = settingsQuery.data ?? [];
  useEffect(() => {
    setSelectedLoreKey(null);
    setEditorMode("create-root");
    setViewMode("browser");
  }, [selectedSettingKey]);
  useEffect(() => {
    if (!selectedSettingKey && settings.length > 0) {
      setSelectedSettingKey(settings[0].key);
    }
  }, [selectedSettingKey, settings]);

  useEffect(() => {
    setSelectedLoreKey(null);
    setEditorMode("create-root");
  }, [selectedSettingKey]);

  const selectedSetting = useMemo(
    () => settings.find((entry) => entry.key === selectedSettingKey) ?? null,
    [selectedSettingKey, settings],
  );

  const loreTreeQuery = useQuery({
    queryKey: ["admin-content", "lore-tree", selectedSettingKey],
    enabled: Boolean(selectedSettingKey),
    queryFn: async () => {
      const response = await api.get(`/game/content/lore/tree/${encodeURIComponent(selectedSettingKey as string)}`);

      return (response.data?.payload ?? []) as LoreTreeNode[];
    },
  });

  const loreTree = loreTreeQuery.data ?? [];
  const loreNodeCount = useMemo(() => countLoreNodes(loreTree), [loreTree]);

  const selectedTreeNode = useMemo(() => findNodeByKey(loreTree, selectedLoreKey), [loreTree, selectedLoreKey]);

  const selectedNodeSummary = useMemo<LoreNodeSummary | null>(() => {
    if (!selectedTreeNode) return null;

    return {
      _id: selectedTreeNode._id,
      key: selectedTreeNode.key,
      name: selectedTreeNode.name,
      kind: selectedTreeNode.kind,
      status: selectedTreeNode.status,
      parentId: selectedTreeNode.parentId ?? null,
    };
  }, [selectedTreeNode]);

  const descendantIds = useMemo(() => collectDescendantIds(selectedTreeNode), [selectedTreeNode]);

  const flatLoreNodes = useMemo(() => flattenTree(loreTree), [loreTree]);

  const parentOptions = useMemo(() => {
    return flatLoreNodes.filter((option) => {
      if (editorMode !== "edit") return true;
      if (!selectedTreeNode) return true;
      if (option._id === selectedTreeNode._id) return false;
      if (descendantIds.has(option._id)) return false;
      return true;
    });
  }, [descendantIds, editorMode, flatLoreNodes, selectedTreeNode]);

  const relationTargets = useMemo(() => {
    if (editorMode === "edit" && selectedTreeNode) {
      return flatLoreNodes.filter((option) => option._id !== selectedTreeNode._id);
    }
    return flatLoreNodes;
  }, [editorMode, flatLoreNodes, selectedTreeNode]);

  const relationTargetOptions = useMemo(() => {
    if (!selectedTreeNode) return flatLoreNodes;

    return flatLoreNodes.filter((option) => option._id !== selectedTreeNode._id);
  }, [flatLoreNodes, selectedTreeNode]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Settings",
        value: String(settings.length),
        copy: "Top-level worlds available to author against.",
      },
      {
        label: "Lore roots",
        value: String(loreTree.length),
        copy: "First-order branches in the current setting tree.",
      },
      {
        label: "Lore nodes",
        value: String(loreNodeCount),
        copy: "Total nodes currently returned by the lore tree endpoint.",
      },
      {
        label: "Focus",
        value: "Atlas view",
        copy: "Select a node from the graph to open its dedicated workspace.",
      },
    ],
    [loreNodeCount, loreTree.length, selectedTreeNode?.name, settings.length],
  );

  const laneItems = useMemo(() => {
    switch (activeType) {
      case "items":
        return [
          {
            id: "items-1",
            title: "Item browser placeholder",
            subtitle: "This lane will reuse the same studio shell.",
            meta: "Next slice",
            description: "Wire item queries and form controls into this panel after lore authoring feels stable.",
          },
        ];
      case "abilities":
        return [
          {
            id: "abilities-1",
            title: "Ability browser placeholder",
            subtitle: "Use the same list + editor split.",
            meta: "Next slice",
            description: "Abilities are structurally easier than lore. Do them after the node workflow is solid.",
          },
        ];
      case "skills":
        return [
          {
            id: "skills-1",
            title: "Skill browser placeholder",
            subtitle: "Simpler content, same composition model.",
            meta: "Later slice",
            description: "Keep skills boring. That’s a compliment. Boring CRUD is reliable CRUD.",
          },
        ];
      case "settings":
        return settings.map((setting) => ({
          id: setting._id,
          title: setting.name,
          subtitle: setting.key,
          meta: "Setting",
          description: setting.description || "No description has been written yet.",
        }));
      default:
        return [];
    }
  }, [activeType, settings]);

  return {
    activeType,
    setActiveType,

    viewMode,
    openEditorForNode,

    selectedSettingKey,
    setSelectedSettingKey,
    selectedSetting,

    selectedLoreKey,
    selectedTreeNode,
    selectedNodeSummary,

    editorMode,
    setEditorMode,

    settings,
    settingsQuery,

    loreTree,
    loreTreeQuery,
    loreNodeCount,

    parentOptions,
    relationTargetOptions,
    summaryCards,
    laneItems,
    relationTargets,

    selectLoreNode: (node: LoreTreeNode) => {
      setSelectedLoreKey(node.key);
      setEditorMode("edit");
      setViewMode("editor");
    },

    startCreateRoot: () => {
      setSelectedLoreKey(null);
      setEditorMode("create-root");
      setViewMode("editor");
    },

    startCreateChild: () => {
      if (!selectedTreeNode) return;
      setEditorMode("create-child");
      setViewMode("editor");
    },

    startEditSelected: () => {
      if (!selectedTreeNode) return;
      setEditorMode("edit");
      setViewMode("editor");
    },

    goBackToBrowser: () => {
      setViewMode("browser");
    },

    cancelCreate: () => {
      setViewMode("browser");
    },

    handleLoreSaved: async (nextKey: string) => {
      setSelectedLoreKey(nextKey);
      setEditorMode("edit");
      await loreTreeQuery.refetch();
      setViewMode("browser");
    },
  };
}
