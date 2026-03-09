// apps/player/src/features/characters/characterSheetScreen/tabs/conditions/condition.helpers.ts

import type { ConditionInstance } from "@tapestry/types";
import {
  CONDITION_DEFINITION_MAP,
  type ConditionDefinition,
} from "./conditionCatalog";

export type EnrichedCondition = ConditionInstance & {
  name: string;
  summary: string;
  tags: string[];
  definition?: ConditionDefinition;
  effectSummary: string[];
};

export function titleCaseFromKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

export function getConditionDefinition(key: string) {
  return CONDITION_DEFINITION_MAP.get(key);
}

export function formatConditionEffects(definition?: ConditionDefinition): string[] {
  if (!definition?.suggestedEffects) return [];

  const fx = definition.suggestedEffects;
  const parts: string[] = [];

  if (fx.burdenOnAllChecks) parts.push("Burden on checks");
  if (fx.burdenOnAttacks) parts.push("Burden on attacks");
  if (fx.edgeAgainstYou) parts.push("Enemies gain Edge vs you");
  if (fx.meleeAttackersGainEdge) parts.push("Melee attackers gain Edge");
  if (fx.movementZero) parts.push("Move = 0");
  if (typeof fx.ongoingHarm === "number") parts.push(`Ongoing Harm ${fx.ongoingHarm}`);
  if (typeof fx.rollPenalty === "number") {
    parts.push(`${fx.rollPenalty} to rolls`);
  }

  if (fx.aspectAdjustments?.length) {
    for (const adj of fx.aspectAdjustments) {
      const label = `${titleCaseFromKey(adj.key)} ${adj.delta >= 0 ? "+" : ""}${adj.delta}`;
      parts.push(label);
    }
  }

  return parts;
}

export function enrichCondition(condition: ConditionInstance): EnrichedCondition {
  const definition = getConditionDefinition(condition.key);

  return {
    ...condition,
    name: definition?.name ?? titleCaseFromKey(condition.key),
    summary: definition?.summary ?? "This condition is affecting the character.",
    tags: definition?.tags ?? [],
    definition,
    effectSummary: formatConditionEffects(definition),
  };
}

export function enrichConditions(conditions: ConditionInstance[] | undefined | null) {
  if (!Array.isArray(conditions)) return [];
  return conditions.map(enrichCondition);
}

export function buildConditionInstance(key: string): ConditionInstance {
  return {
    key,
    stacks: 1,
    appliedAt: new Date().toISOString(),
    expiresAt: null,
    source: "",
    notes: "",
  };
}