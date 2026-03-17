"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NodeEditorForm, { toTagArray, type NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import styles from "./NodeWorkspace.module.scss";

type WorkspaceTab = "editor" | "graph" | "relationships";

type LoreNodeDetail = {
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
type LoreRelation = {
  type: string;
  targetId?: string;
  targetKey?: string;
  label?: string;
  notes?: string;
};

type LoreTreeNode = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  status: "draft" | "published" | "archived";
  depth: number;
  parentId?: string | null;
  children?: LoreTreeNode[];
};

type NodeEditorParentOption = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  depth: number;
};
type NodeWorkspaceProps = {
  nodeId: string;
};

const TAB_OPTIONS: Array<{
  key: WorkspaceTab;
  label: string;
  copy: string;
}> = [
  {
    key: "editor",
    label: "Editor",
    copy: "Edit the core node record.",
  },
  {
    key: "graph",
    label: "Graph",
    copy: "Local neighborhood view comes next.",
  },
  {
    key: "relationships",
    label: "Relationships",
    copy: "Outgoing and incoming links come next.",
  },
];

function toFormValue(node: LoreNodeDetail): NodeEditorFormValue {
  return {
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
  };
}
function toUpdatePayload(form: NodeEditorFormValue) {
  return {
    name: form.name.trim(),
    key: form.key.trim().toLowerCase(),
    kind: form.kind,
    status: form.status,
    parentId: form.parentId || null,
    sortOrder: Number(form.sortOrder || 0),
    tags: toTagArray(form.tags),
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
  };
}

export default function NodeWorkspace({ nodeId }: NodeWorkspaceProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("editor");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const nodeQuery = useQuery({
    queryKey: ["content-node", nodeId],
    enabled: Boolean(nodeId),
    queryFn: async () => {
      const response = await api.get(`/game/content/lore/${nodeId}`);
      return (response.data?.payload ?? response.data) as LoreNodeDetail;
    },
  });

  const node = nodeQuery.data ?? null;
  const treeQuery = useQuery({
    queryKey: ["content-node-tree", node?.settingKey],
    enabled: Boolean(node?.settingKey),
    queryFn: async () => {
      const response = await api.get(`/game/content/lore/tree/${encodeURIComponent(node?.settingKey as string)}`);

      return (response.data?.payload ?? []) as LoreTreeNode[];
    },
  });
  const tree = treeQuery.data ?? [];

  const currentTreeNode = useMemo(() => {
    return node ? findNodeById(tree, node._id) : null;
  }, [node, tree]);

  const descendantIds = useMemo(() => {
    return collectDescendantIds(currentTreeNode);
  }, [currentTreeNode]);

  const flatNodes = useMemo(() => flattenTree(tree), [tree]);

  const parentOptions = useMemo(() => {
    if (!node) return [];

    return flatNodes.filter((option) => {
      if (option._id === node._id) return false;
      if (descendantIds.has(option._id)) return false;
      return true;
    });
  }, [descendantIds, flatNodes, node]);

  const relationTargets = useMemo(() => {
    if (!node) return [];
    return flatNodes.filter((option) => option._id !== node._id);
  }, [flatNodes, node]);
  const saveMutation = useMutation({
    mutationFn: async (formValue: NodeEditorFormValue) => {
      const payload = toUpdatePayload(formValue);
      const response = await api.put(`/game/content/lore/${nodeId}`, payload);
      return (response.data?.payload ?? response.data) as LoreNodeDetail;
    },
    onSuccess: async () => {
      setSaveMessage("Node updated.");
      await queryClient.invalidateQueries({ queryKey: ["content-node", nodeId] });
    },
    onError: () => {
      setSaveMessage(null);
    },
  });

  const metaCards = useMemo(() => {
    if (!node) return [];

    return [
      {
        label: "Setting",
        value: node.settingKey,
      },
      {
        label: "Node key",
        value: node.key,
      },
      {
        label: "Status",
        value: node.status,
      },
      {
        label: "Parent",
        value: node.parentId || "Root node",
      },
    ];
  }, [node]);

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link href="/content" className={styles.backLink}>
            Content
          </Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>Node workspace</span>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Lore node</p>
            <h1 className={styles.title}>{nodeQuery.isLoading ? "Loading node…" : (node?.name ?? "Node not found")}</h1>
            <p className={styles.copy}>
              This page is the focused workspace for a single node. Graph and relationship views live here too, but the
              editor stays the first tab so you can get work done without fighting the whole setting map.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link href="/content" className={styles.ghostButton}>
              Back to content
            </Link>
          </div>
        </div>
      </div>

      {nodeQuery.isError ? (
        <div className={styles.notice}>The node failed to load. Check the id, auth, or lore endpoint.</div>
      ) : nodeQuery.isLoading ? (
        <div className={styles.notice}>Loading node workspace…</div>
      ) : !node ? (
        <div className={styles.notice}>No node was returned for this id.</div>
      ) : (
        <>
          <div className={styles.metaGrid}>
            {metaCards.map((card) => (
              <article key={card.label} className={styles.metaCard}>
                <span className={styles.metaLabel}>{card.label}</span>
                <strong className={styles.metaValue}>{card.value}</strong>
              </article>
            ))}
          </div>

          <div className={styles.tabRow}>
            {TAB_OPTIONS.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className={styles.tabLabel}>{tab.label}</span>
                  <span className={styles.tabCopy}>{tab.copy}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.panel}>
            {activeTab === "editor" ? (
              <NodeEditorForm
                initialValue={toFormValue(node)}
                parentOptions={parentOptions}
                relationTargets={relationTargets}
                isSaving={saveMutation.isPending}
                saveMessage={saveMessage}
                onSave={async (formValue) => {
                  setSaveMessage(null);
                  await saveMutation.mutateAsync(formValue);
                }}
              />
            ) : activeTab === "graph" ? (
              <div className={styles.placeholder}>
                <h2 className={styles.placeholderTitle}>Node graph</h2>
                <p className={styles.placeholderCopy}>
                  This tab will render the current node as the local root and show its immediate children in a focused
                  graph instead of the full setting atlas.
                </p>
              </div>
            ) : (
              <div className={styles.placeholder}>
                <h2 className={styles.placeholderTitle}>Relationships</h2>
                <p className={styles.placeholderCopy}>
                  This tab will show outgoing and incoming relations in separate, readable panels so cross-links stay
                  useful instead of turning into visual spaghetti.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
function flattenTree(nodes: LoreTreeNode[], bucket: NodeEditorParentOption[] = []): NodeEditorParentOption[] {
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

function findNodeById(nodes: LoreTreeNode[], id: string): LoreTreeNode | null {
  for (const node of nodes) {
    if (node._id === id) return node;
    if (node.children?.length) {
      const nested = findNodeById(node.children, id);
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
