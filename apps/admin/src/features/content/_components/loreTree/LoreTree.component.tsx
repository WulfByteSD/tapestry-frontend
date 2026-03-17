"use client";

import styles from "./LoreTree.module.scss";
import type { LoreStatus, LoreTreeNode } from "../../_hooks/useContentStudio";

type LoreTreeProps = {
  nodes: LoreTreeNode[];
  selectedKey: string | null;
  onSelectNode: (node: LoreTreeNode) => void;
  emptyCopy?: string;
};

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

export default function LoreTree({
  nodes,
  selectedKey,
  onSelectNode,
  emptyCopy = "No lore nodes have been returned for this setting yet.",
}: LoreTreeProps) {
  if (!nodes.length) {
    return <div className={styles.empty}>{emptyCopy}</div>;
  }

  return (
    <ul className={styles.treeList}>
      {nodes.map((node) => {
        const isSelected = selectedKey === node.key;
        const childTotal = node.children?.length ?? node.childCount ?? 0;

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
                    {childTotal} child{childTotal === 1 ? "" : "ren"}
                  </span>
                </div>
              </div>

              <div className={styles.treeNodeBody}>
                <span className={styles.treeKey}>{node.key}</span>
                {node.summary ? <p className={styles.treeSummary}>{node.summary}</p> : null}
              </div>
            </button>

            {node.children?.length ? (
              <div className={styles.treeBranch}>
                <LoreTree
                  nodes={node.children}
                  selectedKey={selectedKey}
                  onSelectNode={onSelectNode}
                  emptyCopy={emptyCopy}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
