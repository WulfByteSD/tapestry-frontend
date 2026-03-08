// apps/player/src/features/characters/characterSheetScreen/tabs/skillDisplay.helpers.ts

import type { SkillDefinition } from "@tapestry/types";

export function titleCaseFromKey(key: string) {
  const raw = key.includes(":") ? key.split(":").pop()! : key;

  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

export function buildSkillDefinitionMap(skillDefinitions: SkillDefinition[]) {
  return new Map(skillDefinitions.map((skill) => [skill.key, skill]));
}

export type EnrichedLearnedSkill = {
  key: string;
  rank: number;
  name: string;
  category?: SkillDefinition["category"];
  defaultAspect?: string;
  notes?: string;
  tags: string[];
};

export function enrichLearnedSkills(
  skillsMap: Record<string, number>,
  skillDefinitions: SkillDefinition[],
): EnrichedLearnedSkill[] {
  const byKey = buildSkillDefinitionMap(skillDefinitions);

  return Object.entries(skillsMap)
    .filter(([, rank]) => typeof rank === "number" && !Number.isNaN(rank))
    .map(([key, rank]) => {
      const def = byKey.get(key);

      return {
        key,
        rank,
        name: def?.name ?? titleCaseFromKey(key),
        category: def?.category,
        defaultAspect: def?.defaultAspect,
        notes: def?.notes,
        tags: def?.tags ?? [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type EnrichedSkillOption = {
  id: string;
  name: string;
  rank: number;
  category?: SkillDefinition["category"];
  defaultAspect?: string;
};

export function buildSkillOptions(
  skillsMap: Record<string, number>,
  skillDefinitions: SkillDefinition[],
): EnrichedSkillOption[] {
  const byKey = buildSkillDefinitionMap(skillDefinitions);

  return Object.entries(skillsMap)
    .filter(([, rank]) => typeof rank === "number" && !Number.isNaN(rank))
    .map(([id, rank]) => {
      const def = byKey.get(id);

      return {
        id,
        rank,
        name: def?.name ?? titleCaseFromKey(id),
        category: def?.category,
        defaultAspect: def?.defaultAspect,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
