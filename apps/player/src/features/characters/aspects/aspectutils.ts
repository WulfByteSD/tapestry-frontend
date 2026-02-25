export type AspectGroup = "might" | "finesse" | "wit" | "resolve";
export type AspectKey =
  | "strength"
  | "presence"
  | "agility"
  | "charm"
  | "instinct"
  | "knowledge"
  | "willpower"
  | "empathy";

export const ASPECT_BLOCKS: Array<{
  title: string;
  group: AspectGroup;
  keys: Array<{ label: string; key: AspectKey }>;
}> = [
  {
    title: "Might",
    group: "might",
    keys: [
      { label: "Strength", key: "strength" },
      { label: "Presence", key: "presence" },
    ],
  },
  {
    title: "Finesse",
    group: "finesse",
    keys: [
      { label: "Agility", key: "agility" },
      { label: "Charm", key: "charm" },
    ],
  },
  {
    title: "Wit",
    group: "wit",
    keys: [
      { label: "Instinct", key: "instinct" },
      { label: "Knowledge", key: "knowledge" },
    ],
  },
  {
    title: "Resolve",
    group: "resolve",
    keys: [
      { label: "Willpower", key: "willpower" },
      { label: "Empathy", key: "empathy" },
    ],
  },
];

export function getAspectValue(sheet: any, group: AspectGroup, key: AspectKey): number {
  const v = sheet?.sheet?.aspects?.[group]?.[key];
  return typeof v === "number" ? v : 0;
}

export function aspectPath(group: AspectGroup, key: AspectKey) {
  // payload shape: sheet.sheet.aspects... ; update path: sheet.aspects...
  return `sheet.aspects.${group}.${key}`;
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function sumAllAspects(sheet: any): number {
  let sum = 0;
  for (const b of ASPECT_BLOCKS) {
    for (const k of b.keys) sum += getAspectValue(sheet, b.group, k.key);
  }
  return sum;
}
