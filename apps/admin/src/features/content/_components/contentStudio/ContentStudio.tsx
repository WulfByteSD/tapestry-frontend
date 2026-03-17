"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@tapestry/api-client";
import { api } from "@/lib/api";
import ContentSidebar, { type StudioContentType, type StudioSettingSummary } from "../contentSidebar/ContentSidebar";
import LoreEditor, { type LoreEditorMode, type LoreNodeSummary, type LoreParentOption } from "../loreEditor/LoreEditor";
import styles from "./ContentStudio.module.scss";

type LoreStatus = "draft" | "published" | "archived";

type LoreTreeNode = {
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
  summary?: string;
};

const laneCards = [
  {
    title: "Lore first, because structure matters",
    copy: "Items and abilities are easier once the content studio knows how to create, edit, and rehydrate setting-scoped records cleanly.",
  },
  {
    title: "Tree for containment",
    copy: "Parent and child should mean actual containment. A town contains districts. A nation contains provinces. An NPC does not contain a faction unless you are writing cursed cosmology.",
  },
  {
    title: "Relations next pass",
    copy: "After create/edit is stable, add a real relation editor with searchable targets so belongs-to and allied-with stop living in improvised notes.",
  },
  {
    title: "Preview later",
    copy: "Once authoring is reliable, the body panel can grow into a richer lore preview and link graph without making the form logic miserable.",
  },
];

function countLoreNodes(nodes: LoreTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countLoreNodes(node.children ?? []), 0);
}

function formatKindLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClass(status: LoreStatus) {
  switch (status) {
    case "published":
      return styles.statusPublished;
    case "archived":
      return styles.statusArchived;
    case "draft":
    default:
      return styles.statusDraft;
  }
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

function renderLoreTree(
  nodes: LoreTreeNode[],
  selectedLoreKey: string | null,
  onSelectNode: (node: LoreTreeNode) => void,
): ReactNode {
  if (!nodes.length) {
    return <div className={styles.treeEmpty}>No lore nodes have been returned for this setting yet.</div>;
  }

  return (
    <ul className={styles.treeList}>
      {nodes.map((node) => {
        const isSelected = selectedLoreKey === node.key;

        return (
          <li key={node._id} className={styles.treeItem}>
            <button
              type="button"
              className={`${styles.treeNodeButton} ${isSelected ? styles.treeNodeButtonSelected : ""}`}
              onClick={() => onSelectNode(node)}
            >
              <div className={styles.treeNodeHeader}>
                <strong className={styles.treeNodeName}>{node.name}</strong>

                <div className={styles.treeMeta}>
                  <span className={styles.kindBadge}>{formatKindLabel(node.kind)}</span>
                  <span className={`${styles.statusBadge} ${getStatusClass(node.status)}`}>{node.status}</span>
                  <span className={styles.childBadge}>
                    {node.children?.length ?? node.childCount ?? 0} child
                    {(node.children?.length ?? node.childCount ?? 0) === 1 ? "" : "ren"}
                  </span>
                </div>
              </div>

              <div className={styles.treeNodeBody}>
                <span className={styles.treeKey}>{node.key}</span>
                {node.summary ? <p className={styles.treeSummary}>{node.summary}</p> : null}
              </div>
            </button>

            {node.children?.length ? (
              <div className={styles.treeBranch}>{renderLoreTree(node.children, selectedLoreKey, onSelectNode)}</div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function ContentStudio() {
  const [activeType, setActiveType] = useState<StudioContentType>("lore");
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const [selectedLoreKey, setSelectedLoreKey] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<LoreEditorMode>("create-root");

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

  const parentOptions = useMemo(() => {
    const flat = flattenTree(loreTree);

    return flat.filter((option) => {
      if (editorMode !== "edit") return true;
      if (!selectedTreeNode) return true;

      if (option._id === selectedTreeNode._id) return false;
      if (descendantIds.has(option._id)) return false;

      return true;
    });
  }, [descendantIds, editorMode, loreTree, selectedTreeNode]);

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
        label: "Selected node",
        value: selectedTreeNode?.name ?? "None",
        copy: "The currently focused lore record.",
      },
    ],
    [loreNodeCount, loreTree.length, selectedTreeNode?.name, settings.length],
  );

  return (
    <div className={styles.studio}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Gameplay</p>
        <h1 className={styles.title}>Content studio</h1>
        <p className={styles.subtitle}>
          Lore is the backbone here. Get hierarchical authoring stable first, and the rest of the content lanes get much
          less weird.
        </p>
      </header>

      <div className={styles.layout}>
        <ContentSidebar
          settings={settings}
          selectedSettingKey={selectedSettingKey}
          onSelectSetting={setSelectedSettingKey}
          activeType={activeType}
          onSelectType={setActiveType}
          isLoadingSettings={settingsQuery.isLoading}
          loreNodeCount={loreNodeCount}
          loreRootCount={loreTree.length}
        />

        <div className={styles.workspace}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleWrap}>
                <p className={styles.panelEyebrow}>Overview</p>
                <h2 className={styles.panelTitle}>{selectedSetting?.name ?? "Waiting on a setting"}</h2>
                <p className={styles.panelCopy}>
                  {selectedSetting?.description ||
                    "Pick a setting to start attaching world content to its root record."}
                </p>
              </div>

              {activeType === "lore" ? (
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => {
                      setEditorMode("create-root");
                      setSelectedLoreKey(null);
                    }}
                  >
                    New root node
                  </button>

                  <button
                    type="button"
                    className={styles.ghostButton}
                    disabled={!selectedTreeNode}
                    onClick={() => {
                      if (!selectedTreeNode) return;
                      setEditorMode("create-child");
                    }}
                  >
                    New child node
                  </button>

                  <button
                    type="button"
                    className={styles.ghostButton}
                    disabled={!selectedTreeNode}
                    onClick={() => {
                      if (!selectedTreeNode) return;
                      setEditorMode("edit");
                    }}
                  >
                    Edit selected
                  </button>
                </div>
              ) : null}
            </div>

            <div className={styles.metricGrid}>
              {summaryCards.map((card) => (
                <article key={card.label} className={styles.metricCard}>
                  <span className={styles.metricLabel}>{card.label}</span>
                  <strong className={styles.metricValue}>{card.value}</strong>
                  <p className={styles.metricCopy}>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>

          {activeType === "lore" ? (
            <>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleWrap}>
                    <p className={styles.panelEyebrow}>Lore browser</p>
                    <h2 className={styles.panelTitle}>Hierarchy</h2>
                    <p className={styles.panelCopy}>
                      Select a node to edit it, or use it as the parent for a new child.
                    </p>
                  </div>
                </div>

                {settingsQuery.isError ? (
                  <div className={styles.inlineNotice}>Settings failed to load. Check auth and API origin first.</div>
                ) : loreTreeQuery.isError ? (
                  <div className={styles.inlineNotice}>
                    Lore tree failed to load. That means route/auth/backend trouble, not cosmic betrayal.
                  </div>
                ) : loreTreeQuery.isLoading ? (
                  <div className={styles.inlineNotice}>Loading lore tree…</div>
                ) : (
                  renderLoreTree(loreTree, selectedLoreKey, (node) => {
                    setSelectedLoreKey(node.key);
                    setEditorMode("edit");
                  })
                )}
              </section>

              <LoreEditor
                selectedSettingKey={selectedSettingKey}
                selectedNodeKey={selectedLoreKey}
                selectedNodeSummary={selectedNodeSummary}
                mode={editorMode}
                parentOptions={parentOptions}
                onSaved={(nextKey: any) => {
                  setSelectedLoreKey(nextKey);
                  setEditorMode("edit");
                  loreTreeQuery.refetch();
                }}
                onCancelCreate={() => {
                  if (selectedLoreKey) {
                    setEditorMode("edit");
                    return;
                  }

                  setEditorMode("create-root");
                }}
              />
            </>
          ) : (
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitleWrap}>
                  <p className={styles.panelEyebrow}>Build order</p>
                  <h2 className={styles.panelTitle}>Recommended next slices</h2>
                  <p className={styles.panelCopy}>
                    The lore lane is now the template. Once this feels good, reuse the interaction model for the simpler
                    content types.
                  </p>
                </div>
              </div>

              <div className={styles.laneGrid}>
                {laneCards.map((card) => (
                  <article key={card.title} className={styles.laneCard}>
                    <h3 className={styles.laneTitle}>{card.title}</h3>
                    <p className={styles.laneCopy}>{card.copy}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
