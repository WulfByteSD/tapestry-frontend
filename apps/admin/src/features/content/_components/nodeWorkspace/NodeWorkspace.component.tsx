"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs } from "@tapestry/ui";

import { api } from "@/lib/api";
import type { NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import styles from "./NodeWorkspace.module.scss";
import type { FocusedLoreContext, LoreNodeDetail, LoreTreeNode, NodeWorkspaceProps } from "./nodeWorkspace.types";
import { toUpdatePayload, flattenTree, findNodeById, collectDescendantIds } from "./nodeWorkspace.helper";
import { createTabs, TabKey } from "./nodeWorkspace.tabs";

export default function NodeWorkspace({ nodeId }: NodeWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("editor");

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

  const graphQuery = useQuery({
    queryKey: ["content-node-context", nodeId, 3],
    enabled: Boolean(nodeId),
    queryFn: async () => {
      const response = await api.get(`/game/content/lore/context/${encodeURIComponent(nodeId)}?descendantDepth=3`);
      return (response.data?.payload ?? null) as FocusedLoreContext | null;
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
      await queryClient.invalidateQueries({
        queryKey: ["content-node-context", nodeId, 2],
      });
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

  const tabItems = useMemo(() => {
    if (!node) return [];

    return createTabs({
      node,
      activeTab,
      parentOptions,
      relationTargets,
      isSaving: saveMutation.isPending,
      saveMessage,
      graphContext: graphQuery.data ?? null,
      graphLoading: graphQuery.isLoading,
      graphError: graphQuery.isError,
      onSave: async (formValue) => {
        setSaveMessage(null);
        await saveMutation.mutateAsync(formValue);
      },
      onOpenGraphNode: (targetNodeId) => {
        router.push(`/content/node/${targetNodeId}`);
      },
      onOpenRelationNode: (targetNodeId) => {
        router.push(`/content/node/${targetNodeId}`);
      },
    });
  }, [
    node,
    activeTab,
    parentOptions,
    relationTargets,
    saveMutation,
    saveMessage,
    graphQuery.data,
    graphQuery.isLoading,
    graphQuery.isError,
    router,
  ]);

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
            {node ? (
              <Link
                href={`/content/node/new?settingKey=${encodeURIComponent(node.settingKey)}&parentId=${encodeURIComponent(node._id)}`}
                className={styles.ghostButton}
              >
                New child node
              </Link>
            ) : null}

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

          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
            items={tabItems}
            defaultActiveKey="editor"
            variant="pills"
            fit="equal"
          />
        </>
      )}
    </section>
  );
}
