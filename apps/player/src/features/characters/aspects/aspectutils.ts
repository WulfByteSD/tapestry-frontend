import { ASPECT_BLOCKS, type AspectGroup, type AspectKey } from "@tapestry/types";

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
