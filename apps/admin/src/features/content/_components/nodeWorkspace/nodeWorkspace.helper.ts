import type { NodeEditorFormValue } from "../nodeEditorForm/NodeEditorForm.component";
import type { LoreNodeDetail, LoreTreeNode, NodeEditorParentOption } from "./nodeWorkspace.types";

export function toFormValue(node: LoreNodeDetail): NodeEditorFormValue {
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

export function toUpdatePayload(form: NodeEditorFormValue) {
  return {
    name: form.name.trim(),
    key: form.key.trim().toLowerCase(),
    kind: form.kind,
    status: form.status,
    parentId: form.parentId || null,
    sortOrder: Number(form.sortOrder || 0),
    tags: form.tags
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
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

export function flattenTree(nodes: LoreTreeNode[], bucket: NodeEditorParentOption[] = []): NodeEditorParentOption[] {
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

export function findNodeById(nodes: LoreTreeNode[], id: string): LoreTreeNode | null {
  for (const node of nodes) {
    if (node._id === id) return node;
    if (node.children?.length) {
      const nested = findNodeById(node.children, id);
      if (nested) return nested;
    }
  }

  return null;
}

export function collectDescendantIds(node: LoreTreeNode | null, bucket = new Set<string>()) {
  if (!node?.children?.length) return bucket;

  for (const child of node.children) {
    bucket.add(child._id);
    collectDescendantIds(child, bucket);
  }

  return bucket;
}
