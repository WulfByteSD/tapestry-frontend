import type { LoreParentOption } from "./lore.types";

export const LORE_KIND_OPTIONS = [
  "region",
  "nation",
  "province",
  "settlement",
  "district",
  "landmark",
  "faction",
  "npc",
  "organization",
  "culture",
  "religion",
  "event",
  "history",
  "other",
] as const;

export const STATUS_OPTIONS = ["draft", "published", "archived"] as const;

export function slugifyKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function formatParentLabel(option: LoreParentOption) {
  const indent = "— ".repeat(Math.max(option.depth, 0));
  return `${indent}${option.name} (${option.kind})`;
}

export function toTagsInput(tags?: string[]) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export function toTagArray(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}
