// apps/player/src/features/characters/characterSheetScreen/tabs/abilities/abilities.functions.ts

import type { AbilityCost, AbilityDefinition, CharacterLearnedAbility, EffectiveAbility } from "@tapestry/types";

export function normalizeLearnedAbilities(
  abilities: CharacterLearnedAbility[] | undefined | null,
): CharacterLearnedAbility[] {
  if (!Array.isArray(abilities)) return [];

  return abilities.filter(
    (entry): entry is CharacterLearnedAbility =>
      !!entry &&
      typeof entry.abilityKey === "string" &&
      entry.abilityKey.trim().length > 0 &&
      typeof entry.abilityId === "string" &&
      entry.abilityId.trim().length > 0,
  );
}

export function addLearnedAbility(
  current: CharacterLearnedAbility[],
  ability: AbilityDefinition,
): CharacterLearnedAbility[] {
  if (current.some((entry) => entry.abilityKey === ability.key)) {
    return current;
  }

  return [
    ...current,
    {
      abilityId: ability._id,
      abilityKey: ability.key,
      sourceType: "learned",
    },
  ];
}

export function removeLearnedAbility(
  current: CharacterLearnedAbility[],
  abilityKey: string,
): CharacterLearnedAbility[] {
  return current.filter((entry) => entry.abilityKey !== abilityKey);
}

export function titleCaseFallback(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

export function formatAbilityCost(cost?: AbilityCost | null) {
  if (!cost) return "";

  const parts: string[] = [];

  if (typeof cost.amount === "number" && cost.resourceKey) {
    parts.push(`${cost.amount} ${titleCaseFallback(cost.resourceKey)}`);
  }

  if (typeof cost.charges === "number") {
    parts.push(`${cost.charges} Charges`);
  }

  if (typeof cost.cooldownTurns === "number") {
    parts.push(`${cost.cooldownTurns} Turn Cooldown`);
  }

  return parts.join(" • ");
}

export function formatAbilityMeta(ability: { activation?: string; usageModel?: string; cost?: AbilityCost | null }) {
  const parts: string[] = [];

  if (ability.activation) {
    parts.push(titleCaseFallback(ability.activation));
  }

  if (ability.usageModel) {
    parts.push(titleCaseFallback(ability.usageModel));
  }

  const costLabel = formatAbilityCost(ability.cost);
  if (costLabel) {
    parts.push(costLabel);
  }

  return parts.join(" • ");
}

export function groupEffectiveAbilities(effective: EffectiveAbility[]) {
  return {
    learned: effective.filter((entry) => entry.sourceType === "learned"),
    item: effective.filter((entry) => entry.sourceType === "item"),
  };
}
