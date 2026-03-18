"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowInstance,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import graphStyles from "../loreGraphView/LoreGraph.module.scss";
import type { FocusedLoreContext, LoreRelation, LoreRelationTargetRef } from "./nodeWorkspace.types";

type RelationshipGraphTabProps = {
  context: FocusedLoreContext | null;
  currentNodeId: string;
  isLoading?: boolean;
  isError?: boolean;
  active?: boolean;
  onOpenNode?: (nodeId: string) => void;
};

type RelationGraphNodeData = {
  label: string;
  kind: string;
  status: "draft" | "published" | "archived";
  relationText?: string;
  isFocus: boolean;
  sourceNodeId?: string;
  navigable: boolean;
};

type RelationGraphNode = Node<RelationGraphNodeData>;

type RelationBucket = {
  key: string;
  targetId?: string;
  targetKey?: string;
  targetName: string;
  targetKind: string;
  targetStatus: "draft" | "published" | "archived";
  relations: LoreRelation[];
};

function formatKindLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRelationLabel(relations: LoreRelation[]) {
  const labels = Array.from(
    new Set(relations.map((relation) => relation.label?.trim() || relation.type?.trim()).filter(Boolean)),
  );

  return labels.join(" • ");
}

function getResolvedTarget(relation: LoreRelation): LoreRelationTargetRef | null {
  return relation.targetNode ?? relation.target ?? null;
}

function bucketRelations(relations: LoreRelation[] = []): RelationBucket[] {
  const grouped = new Map<string, RelationBucket>();

  for (const relation of relations) {
    const resolvedTarget = getResolvedTarget(relation);

    const targetId = resolvedTarget?._id ?? relation.targetId;
    const targetKey = resolvedTarget?.key ?? relation.targetKey;
    const targetName =
      resolvedTarget?.name ??
      relation.label?.trim() ??
      relation.targetKey?.trim() ??
      relation.targetId?.trim() ??
      "Unknown target";

    const targetKind = resolvedTarget?.kind ?? "other";
    const targetStatus = resolvedTarget?.status ?? "draft";

    const bucketKey = targetId || targetKey || `${relation.type}:${targetName}`;

    const existing = grouped.get(bucketKey);
    if (existing) {
      existing.relations.push(relation);
      continue;
    }

    grouped.set(bucketKey, {
      key: bucketKey,
      targetId,
      targetKey,
      targetName,
      targetKind,
      targetStatus,
      relations: [relation],
    });
  }

  return Array.from(grouped.values());
}

function getOrbitPlacement(index: number, total: number) {
  // Single ring for small counts, then expand outward in rings.
  const ringCapacities = [8, 12, 16];
  let remaining = index;
  let ringIndex = 0;

  while (remaining >= (ringCapacities[ringIndex] ?? 20)) {
    remaining -= ringCapacities[ringIndex] ?? 20;
    ringIndex += 1;
  }

  const ringSize = ringCapacities[ringIndex] ?? 20;
  const radius = 340 + ringIndex * 220;

  // Start near top-right instead of straight up so the layout feels less rigid.
  const angleOffset = -Math.PI / 3;
  const angle = angleOffset + (remaining / ringSize) * Math.PI * 2;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

function RelationNodeCard({ data }: NodeProps<RelationGraphNode>) {
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
      <Handle id="relation-in" type="target" position={Position.Top} className={graphStyles.relationHandle} />

      <div className={graphStyles.nodeHeader}>
        <strong className={graphStyles.nodeName}>{data.label}</strong>

        <div className={graphStyles.nodeMeta}>
          <span className={graphStyles.kindBadge}>{formatKindLabel(data.kind)}</span>

          {data.isFocus ? <span className={graphStyles.countBadge}>Current</span> : null}

          {!data.isFocus && data.relationText ? <span className={graphStyles.countBadge}>Related</span> : null}
        </div>
      </div>

      {!data.isFocus && data.relationText ? <p className={graphStyles.summary}>{data.relationText}</p> : null}

      <Handle id="relation-out" type="source" position={Position.Bottom} className={graphStyles.relationHandle} />
    </div>
  );
}

const nodeTypes = {
  relationNode: RelationNodeCard,
};

function buildRelationshipGraph(context: FocusedLoreContext): {
  nodes: RelationGraphNode[];
  edges: Edge[];
} {
  const node = context.focus;
  const relationBuckets = bucketRelations(node.relations ?? []);

  const nodes: RelationGraphNode[] = [
    {
      id: node._id,
      type: "relationNode",
      position: { x: 0, y: 0 },
      draggable: false,
      data: {
        label: node.name,
        kind: node.kind ?? "other",
        status: node.status ?? "draft",
        isFocus: true,
        navigable: false,
        sourceNodeId: node._id,
      },
    },
  ];

  const edges: Edge[] = [];

  relationBuckets.forEach((bucket, index) => {
    const { x, y } = getOrbitPlacement(index, relationBuckets.length);
    const relationText = formatRelationLabel(bucket.relations);

    const targetNodeId = bucket.targetId;
    const graphNodeId = targetNodeId || `relation:${bucket.key}`;

    nodes.push({
      id: graphNodeId,
      type: "relationNode",
      position: { x, y },
      draggable: false,
      data: {
        label: bucket.targetName,
        kind: bucket.targetKind,
        status: bucket.targetStatus,
        relationText,
        isFocus: false,
        navigable: Boolean(targetNodeId),
        sourceNodeId: targetNodeId,
      },
    });

    const firstDirection = bucket.relations[0]?.direction ?? "outgoing";
    const isIncoming = firstDirection === "incoming";

    edges.push({
      id: `relation:${node._id}:${graphNodeId}`,
      source: isIncoming ? graphNodeId : node._id,
      target: isIncoming ? node._id : graphNodeId,
      sourceHandle: "relation-out",
      targetHandle: "relation-in",
      type: "smoothstep",
      label: relationText,
      markerEnd: { type: MarkerType.ArrowClosed },
      className: graphStyles.relationEdge,
      selectable: false,
      focusable: false,
      zIndex: 0,
      labelStyle: { fontSize: 11, fontWeight: 700 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 999,
    });
  });

  return { nodes, edges };
}

export default function RelationshipGraphTab({
  context,
  currentNodeId,
  isLoading = false,
  isError = false,
  active,
  onOpenNode,
}: RelationshipGraphTabProps) {
  const graph = useMemo(() => (context ? buildRelationshipGraph(context) : { nodes: [], edges: [] }), [context]);
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    if (!active || !instance || !graph.nodes.length) return;

    const id = requestAnimationFrame(() => {
      instance.fitView({
        padding: 0.28,
        minZoom: 0.2,
        maxZoom: 1.3,
        duration: 250,
      });
    });

    return () => cancelAnimationFrame(id);
  }, [active, instance, graph.nodes.length]);
  if (isLoading) {
    return <div className={graphStyles.empty}>Loading relationships…</div>;
  }

  if (isError) {
    return <div className={graphStyles.empty}>Failed to load relationship data.</div>;
  }

  if (!context?.focus) {
    return <div className={graphStyles.empty}>No context data available.</div>;
  }

  if (!context.focus.relations?.length) {
    return <div className={graphStyles.empty}>No relationships have been added to this node yet.</div>;
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
          onNodeClick={(_, clickedNode) => {
            const targetId = clickedNode.data.sourceNodeId;
            if (!clickedNode.data.navigable || !targetId || targetId === currentNodeId) {
              return;
            }

            onOpenNode?.(targetId);
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
