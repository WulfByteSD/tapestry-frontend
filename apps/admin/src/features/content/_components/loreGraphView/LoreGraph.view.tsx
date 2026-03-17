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
};

type GraphNodeData = {
  label: string;
  kind: string;
  status: LoreStatus;
  summary?: string;
  childCount: number;
  selected: boolean;
  sourceNode: LoreTreeNode;
};

type GraphNode = Node<GraphNodeData, "loreNode">;

function formatKindLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function LoreGraphNode({ data }: NodeProps<GraphNode>) {
  const statusClass =
    data.status === "published"
      ? styles.statusPublished
      : data.status === "archived"
        ? styles.statusArchived
        : styles.statusDraft;

  return (
    <div className={`${styles.nodeCard} ${statusClass} ${data.selected ? styles.nodeCardSelected : ""}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} isConnectable={false} />

      <div className={styles.nodeHeader}>
        <strong className={styles.nodeName}>{data.label}</strong>

        <div className={styles.nodeMeta}>
          <span className={styles.kindBadge}>{formatKindLabel(data.kind)}</span>
          <span className={styles.countBadge}>
            {data.childCount} child{data.childCount === 1 ? "" : "ren"}
          </span>
        </div>
      </div>

      {data.summary ? <p className={styles.summary}>{data.summary}</p> : null}

      <Handle type="source" position={Position.Bottom} className={styles.handle} isConnectable={false} />
    </div>
  );
}

const nodeTypes = {
  loreNode: LoreGraphNode,
};

const HORIZONTAL_GAP = 280;
const VERTICAL_GAP = 180;

function buildGraph(tree: LoreTreeNode[], selectedKey: string | null) {
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
      const childXs = children.map((child) => walk(child, depth + 1));
      x = childXs.reduce((sum, value) => sum + value, 0) / childXs.length;

      for (const child of children) {
        edges.push({
          id: `${node._id}-${child._id}`,
          source: node._id,
          target: child._id,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          selectable: false,
          focusable: false,
        });
      }
    }

    const childCount = children.length || node.childCount || 0;

    nodes.push({
      id: node._id,
      type: "loreNode",
      position: {
        x,
        y: depth * VERTICAL_GAP,
      },
      draggable: false,
      selectable: true,
      data: {
        label: node.name,
        kind: node.kind,
        status: node.status,
        summary: node.summary,
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
      y: node.position.y + 50,
    },
  }));

  return { nodes: normalizedNodes, edges };
}

export default function LoreGraphView({ tree, selectedKey, onOpenNode }: LoreGraphViewProps) {
  const graph = useMemo(() => buildGraph(tree, selectedKey), [tree, selectedKey]);

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
          onNodeClick={(_, node) => onOpenNode(node.data.sourceNode)}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
