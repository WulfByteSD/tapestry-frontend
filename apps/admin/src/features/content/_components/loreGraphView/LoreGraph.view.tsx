"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styles from "./LoreGraph.module.scss";
import type { LoreStatus, LoreTreeNode } from "../../_hooks/useContentStudio";

type LoreGraphViewProps = {
  tree: LoreTreeNode[];
  selectedKey: string | null;
  onOpenNode: (node: LoreTreeNode) => void;
  settingNode: {
    key: string;
    name: string;
  } | null;
};

type GraphNodeData = {
  label: string;
  kind: string;
  status: LoreStatus | "setting";
  summary?: string;
  childCount: number;
  selected: boolean;
  sourceNode: LoreTreeNode | null;
  isSetting?: boolean;
};

type GraphNode = Node<GraphNodeData, "loreNode">;

function formatKindLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function LoreGraphNode({ data }: NodeProps<GraphNode>) {
  const statusClass =
    data.status === "published"
      ? styles.statusPublished
      : data.status === "archived"
        ? styles.statusArchived
        : data.status === "setting"
          ? styles.statusSetting
          : styles.statusDraft;

  return (
    <div
      className={`${styles.nodeCard} ${statusClass} ${
        data.selected ? styles.nodeCardSelected : ""
      } ${data.isSetting ? styles.settingNodeCard : ""}`}
    >
      <Handle id="hierarchy-in" type="target" position={Position.Top} className={styles.handle} isConnectable={false} />

      <Handle
        id="relation-in"
        type="target"
        position={Position.Left}
        className={styles.relationHandle}
        isConnectable={false}
      />

      <div className={styles.nodeHeader}>
        <strong className={styles.nodeName}>{data.label}</strong>

        <div className={styles.nodeMeta}>
          <span className={styles.kindBadge}>{data.isSetting ? "Setting" : formatKindLabel(data.kind)}</span>
          {!data.isSetting ? (
            <span className={styles.countBadge}>
              {data.childCount} child{data.childCount === 1 ? "" : "ren"}
            </span>
          ) : null}
        </div>
      </div>

      {data.summary ? <p className={styles.summary}>{data.summary}</p> : null}

      <Handle
        id="relation-out"
        type="source"
        position={Position.Right}
        className={styles.relationHandle}
        isConnectable={false}
      />

      <Handle
        id="hierarchy-out"
        type="source"
        position={Position.Bottom}
        className={styles.handle}
        isConnectable={false}
      />
    </div>
  );
}

const nodeTypes = {
  loreNode: LoreGraphNode,
};

const HORIZONTAL_GAP = 280;
const VERTICAL_GAP = 180;
const SETTING_NODE_ID = "__setting_root__";

function flattenNodes(tree: LoreTreeNode[], bucket: LoreTreeNode[] = []) {
  for (const node of tree) {
    bucket.push(node);
    if (node.children?.length) {
      flattenNodes(node.children, bucket);
    }
  }
  return bucket;
}

function buildGraph(tree: LoreTreeNode[], selectedKey: string | null, settingNode: LoreGraphViewProps["settingNode"]) {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  let leafIndex = 0;

  function walk(node: LoreTreeNode, depth: number): number {
    const children = node.children ?? [];
    let x: number;

    if (!children.length) {
      x = leafIndex * HORIZONTAL_GAP;
      leafIndex += 1;
    } else {
      const childXs = children.map((child: LoreTreeNode) => walk(child, depth + 1));
      x = childXs.reduce((sum: number, value: number) => sum + value, 0) / childXs.length;

      for (const child of children) {
        edges.push({
          id: `hierarchy:${node._id}-${child._id}`,
          source: node._id,
          target: child._id,
          sourceHandle: "hierarchy-out",
          targetHandle: "hierarchy-in",
          type: "smoothstep",
          // pathOptions: { offset: 24, borderRadius: 24 },
          markerEnd: { type: MarkerType.ArrowClosed },
          selectable: false,
          focusable: false,
          className: styles.hierarchyEdge,
          zIndex: 0,
        });
      }
    }

    const childCount = children.length || node.childCount || 0;

    nodes.push({
      id: node._id,
      type: "loreNode",
      position: {
        x,
        y: depth * VERTICAL_GAP + VERTICAL_GAP,
      },
      draggable: false,
      selectable: true,
      data: {
        label: node.name,
        kind: node.kind,
        status: node.status,
        childCount,
        selected: selectedKey === node.key,
        sourceNode: node,
      },
    });

    return x;
  }

  for (const root of tree) {
    walk(root, 0);
  }

  const minX = nodes.length ? Math.min(...nodes.map((node) => node.position.x)) : 0;
  const normalizedNodes = nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x - minX + 80,
      y: node.position.y,
    },
  }));

  if (settingNode && normalizedNodes.length) {
    const rootNodes = normalizedNodes.filter((node) => tree.some((entry) => entry._id === node.id));

    const averageRootX = rootNodes.reduce((sum, node) => sum + node.position.x, 0) / rootNodes.length;

    normalizedNodes.push({
      id: SETTING_NODE_ID,
      type: "loreNode",
      position: {
        x: averageRootX,
        y: 20,
      },
      draggable: false,
      selectable: false,
      data: {
        label: settingNode.name,
        kind: "setting",
        status: "setting",
        childCount: rootNodes.length,
        selected: false,
        sourceNode: null,
        isSetting: true,
      },
    });

    for (const rootNode of rootNodes) {
      edges.push({
        id: `setting:${SETTING_NODE_ID}-${rootNode.id}`,
        source: SETTING_NODE_ID,
        target: rootNode.id,
        sourceHandle: "hierarchy-out",
        targetHandle: "hierarchy-in",
        type: "smoothstep",
        // pathOptions: { offset: 24, borderRadius: 24 },
        markerEnd: { type: MarkerType.ArrowClosed },
        selectable: false,
        focusable: false,
        className: styles.settingEdge,
        zIndex: 0,
      });
    }
  }

  return { nodes: normalizedNodes, edges };
}

export default function LoreGraphView({ tree, selectedKey, onOpenNode, settingNode }: LoreGraphViewProps) {
  const graph = useMemo(() => buildGraph(tree, selectedKey, settingNode), [tree, selectedKey, settingNode]);

  if (!tree.length) {
    return <div className={styles.empty}>No lore nodes exist for this setting yet. Create a root node first.</div>;
  }

  return (
    <div className={styles.shell}>
      <div className={styles.canvas}>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onNodeClick={(_, node) => {
            if (node.data.sourceNode) {
              onOpenNode(node.data.sourceNode);
            }
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
