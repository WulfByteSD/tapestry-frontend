"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs } from "@tapestry/ui";

import { api } from "@/lib/api";
import NodeEditorForm, { type NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import styles from "./NodeWorkspace.module.scss";
import type { LoreNodeDetail, LoreTreeNode } from "./nodeWorkspace.types";
import { createEmptyNodeEditorFormValue, flattenTree, toUpdatePayload } from "./nodeWorkspace.helper";

type NewNodeWorkspaceProps = {
  settingKey: string;
  parentId?: string | null;
};

export default function NewNodeWorkspace({ settingKey, parentId = null }: NewNodeWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const treeQuery = useQuery({
    queryKey: ["content-node-tree", settingKey],
    enabled: Boolean(settingKey),
    queryFn: async () => {
      const response = await api.get(`/game/content/lore/tree/${encodeURIComponent(settingKey)}`);

      return (response.data?.payload ?? []) as LoreTreeNode[];
    },
  });

  const tree = treeQuery.data ?? [];
  const flatNodes = useMemo(() => flattenTree(tree), [tree]);

  const parentOptions = flatNodes;
  const relationTargets = flatNodes;

  const parentNode = useMemo(() => flatNodes.find((option) => option._id === parentId) ?? null, [flatNodes, parentId]);

  const initialValue = useMemo(
    () =>
      createEmptyNodeEditorFormValue({
        settingKey,
        parentId,
      }),
    [parentId, settingKey],
  );

  const createMutation = useMutation({
    mutationFn: async (formValue: NodeEditorFormValue) => {
      const payload = {
        settingKey: formValue.settingKey.trim(),
        ...toUpdatePayload(formValue),
      };

      const response = await api.post("/game/content/lore", payload);

      return (response.data?.payload ?? response.data) as LoreNodeDetail;
    },
    onSuccess: async (created) => {
      console.log("Created node:", created);
      setSaveMessage("Node created.");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-content", "lore-tree", settingKey],
        }),
        queryClient.invalidateQueries({
          queryKey: ["content-node-tree", settingKey],
        }),
      ]);

      if (!created) {
        setSaveMessage("Node created, but the API did not return an id.");
        return;
      }

      router.replace(`/content/node/${created}`);
    },
    onError: () => {
      setSaveMessage(null);
    },
  });

  const tabItems = useMemo(
    () => [
      {
        key: "editor",
        label: "Editor",
        children: (
          <NodeEditorForm
            initialValue={initialValue}
            parentOptions={parentOptions}
            relationTargets={relationTargets}
            isSaving={createMutation.isPending}
            saveMessage={saveMessage}
            mode={parentId ? "create-child" : "create-root"}
            onSave={async (formValue) => {
              setSaveMessage(null);
              await createMutation.mutateAsync(formValue);
            }}
          />
        ),
      },
    ],
    [createMutation, initialValue, parentId, parentOptions, relationTargets, saveMessage],
  );

  if (!settingKey) {
    return (
      <section className={styles.page}>
        <div className={styles.header}>
          <div className={styles.breadcrumbs}>
            <Link href="/content" className={styles.backLink}>
              Content
            </Link>
            <span className={styles.separator}>/</span>
            <span className={styles.current}>New node</span>
          </div>
        </div>

        <div className={styles.notice}>
          Missing setting key. Start from the content atlas or from an existing node workspace.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link href="/content" className={styles.backLink}>
            Content
          </Link>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>New node</span>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>Lore node</p>
            <h1 className={styles.title}>{parentId ? "Create child node" : "Create root node"}</h1>
            <p className={styles.copy}>
              {parentId
                ? "You’re creating a child node in the containment hierarchy. Relations still stay separate."
                : "You’re creating a new root-level lore node for this setting."}
            </p>
          </div>

          <div className={styles.headerActions}>
            {parentId ? (
              <Link href={`/content/node/${encodeURIComponent(parentId)}`} className={styles.ghostButton}>
                Back to parent
              </Link>
            ) : null}

            <Link href="/content" className={styles.ghostButton}>
              Back to content
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.metaGrid}>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>Setting</span>
          <strong className={styles.metaValue}>{settingKey}</strong>
        </article>

        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>Parent</span>
          <strong className={styles.metaValue}>{parentNode?.name ?? "Root"}</strong>
        </article>

        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>Mode</span>
          <strong className={styles.metaValue}>{parentId ? "create-child" : "create-root"}</strong>
        </article>
      </div>

      {treeQuery.isError ? (
        <div className={styles.notice}>
          Lore tree failed to load. You can still draft the node, but parent and relation pickers may be incomplete.
        </div>
      ) : null}

      <Tabs items={tabItems} defaultActiveKey="editor" variant="pills" fit="equal" />
    </section>
  );
}
