// tabs/skills/skills.functions.ts

import type { SkillDefinition } from "@tapestry/types";

export function normalizeSkillsMap(skills: Record<string, number> | undefined | null): Record<string, number> {
  if (!skills || typeof skills !== "object") return {};
  return Object.fromEntries(
    Object.entries(skills).filter(
      ([key, value]) => typeof key === "string" && typeof value === "number" && Number.isFinite(value),
    ),
  );
}

export function addSkillToMap(
  current: Record<string, number>,
  skill: SkillDefinition,
  initialRank = 1,
): Record<string, number> {
  if (current[skill.key] !== undefined) return current;
  return {
    ...current,
    [skill.key]: Math.max(1, initialRank),
  };
}

export function updateSkillRank(
  current: Record<string, number>,
  skillKey: string,
  nextRank: number,
): Record<string, number> {
  if (nextRank <= 0) {
    const { [skillKey]: _removed, ...rest } = current;
    return rest;
  }

  return {
    ...current,
    [skillKey]: Math.max(1, Math.floor(nextRank)),
  };
}

export function removeSkillFromMap(current: Record<string, number>, skillKey: string): Record<string, number> {
  const { [skillKey]: _removed, ...rest } = current;
  return rest;
}

export function titleCaseFallback(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}
