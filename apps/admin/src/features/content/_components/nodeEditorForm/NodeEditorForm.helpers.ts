import type { NodeEditorParentOption } from "../nodeWorkspace/nodeWorkspace.types";

export function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function formatParentLabel(option: NodeEditorParentOption) {
  const indent = "— ".repeat(Math.max(option.depth, 0));
  return `${indent}${option.name} (${option.kind})`;
}

export function createDraftId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
