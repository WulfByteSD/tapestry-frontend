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

import graphStyles from "../loreGraphView/LoreGraph.module.scss";
import type { FocusedLoreContext, FocusedLoreTreeNode } from "./nodeWorkspace.types";

type NodeGraphTabProps = {
  context: FocusedLoreContext | null;
  currentNodeId: string;
  isLoading?: boolean;
  isError?: boolean;
  onOpenNode: (nodeId: string) => void;
};

type GraphNodeData = {
  label: string;
  kind: string;
  status: "draft" | "published" | "archived";
  summary?: string;
  childCount: number;
  hasChildren: boolean;
  isFocus: boolean;
  isLineage: boolean;
  sourceNodeId: string;
};

type GraphNode = Node<GraphNodeData>;

const HORIZONTAL_GAP = 280;
const VERTICAL_GAP = 180;

function formatKindLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function FocusedGraphNode({ data }: NodeProps<GraphNode>) {
  const statusClass =
    data.status === "published"
      ? graphStyles.statusPublished
      : data.status === "archived"
        ? graphStyles.statusArchived
        : graphStyles.statusDraft;

  const cardClass = [graphStyles.nodeCard, statusClass, data.isFocus ? graphStyles.nodeCardSelected : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <Handle id="hierarchy-in" type="target" position={Position.Top} className={graphStyles.handle} />

      <div className={graphStyles.nodeHeader}>
        <strong className={graphStyles.nodeName}>{data.label}</strong>

        <div className={graphStyles.nodeMeta}>
          <span className={graphStyles.kindBadge}>{formatKindLabel(data.kind)}</span>

          <span className={graphStyles.countBadge}>
            {data.childCount} child{data.childCount === 1 ? "" : "ren"}
          </span>

          {data.isFocus ? <span className={graphStyles.countBadge}>Current</span> : null}

          {!data.isFocus && data.isLineage ? <span className={graphStyles.countBadge}>Lineage</span> : null}
        </div>
      </div>

      {data.summary ? <p className={graphStyles.summary}>{data.summary}</p> : null}

      <Handle id="hierarchy-out" type="source" position={Position.Bottom} className={graphStyles.handle} />
    </div>
  );
}

const nodeTypes = {
  loreNode: FocusedGraphNode,
};

function buildFocusedGraph(tree: FocusedLoreTreeNode | null): {
  nodes: GraphNode[];
  edges: Edge[];
} {
  if (!tree) {
    return { nodes: [], edges: [] };
  }

  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  let leafIndex = 0;

  function walk(node: FocusedLoreTreeNode, depth: number): number {
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
          id: `hierarchy:${node._id}-${child._id}`,
          source: node._id,
          target: child._id,
          sourceHandle: "hierarchy-out",
          targetHandle: "hierarchy-in",
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
          selectable: false,
          focusable: false,
          className: graphStyles.hierarchyEdge,
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
        y: depth * VERTICAL_GAP + 40,
      },
      draggable: false,
      selectable: true,
      data: {
        label: node.name,
        kind: node.kind,
        status: node.status,
        summary: node.summary,
        childCount,
        hasChildren: Boolean(node.hasChildren ?? children.length),
        isFocus: Boolean(node.isFocus),
        isLineage: Boolean(node.isLineage),
        sourceNodeId: node._id,
      },
    });

    return x;
  }

  walk(tree, 0);

  const minX = nodes.length ? Math.min(...nodes.map((node) => node.position.x)) : 0;

  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: {
        x: node.position.x - minX + 80,
        y: node.position.y,
      },
    })),
    edges,
  };
}

export default function NodeGraphTab({
  context,
  currentNodeId,
  isLoading = false,
  isError = false,
  onOpenNode,
}: NodeGraphTabProps) {
  const graph = useMemo(() => buildFocusedGraph(context?.tree ?? null), [context]);

  if (isLoading) {
    return <div className={graphStyles.empty}>Loading focused node graph…</div>;
  }

  if (isError) {
    return (
      <div className={graphStyles.empty}>
        The focused graph failed to load. The editor can still work, but this graph tab needs the new context endpoint.
      </div>
    );
  }

  if (!context?.tree) {
    return <div className={graphStyles.empty}>No focused graph data was returned for this node.</div>;
  }

  return (
    <div className={graphStyles.shell}>
      <div className={graphStyles.canvas}>
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
          onNodeClick={(_, node) => {
            const targetId = node.data.sourceNodeId;
            if (targetId && targetId !== currentNodeId) {
              onOpenNode(targetId);
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
