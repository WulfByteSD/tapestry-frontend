// packages/types/src/abilities.ts

export type AbilityCategory =
  | "spell"
  | "technique"
  | "augment"
  | "program"
  | "prayer"
  | "mutation"
  | "feature"
  | "other";

export type AbilitySourceType = "learned" | "item-granted" | "implant-granted" | "feature-granted" | "innate";

export type AbilityActivation = "action" | "bonus" | "reaction" | "passive" | "downtime" | "special";

export type AbilityUsageModel = "at-will" | "resource-cost" | "per-scene" | "per-rest" | "cooldown" | "charges";

export type AbilityCost = {
  resourceKey?: string;
  amount?: number;
  charges?: number;
  cooldownTurns?: number;
};

export type GrantedAbilityRef = {
  abilityId: string;
  abilityKey: string;
  requiresEquipped?: boolean;
  grantMode?: "passive" | "active";
  notes?: string;
};

export type AbilityDefinition = {
  _id: string;
  key: string;
  name: string;
  status: "draft" | "published" | "archived";
  settingKeys: string[];
  category: AbilityCategory;
  sourceType: AbilitySourceType;
  activation: AbilityActivation;
  usageModel: AbilityUsageModel;
  cost?: AbilityCost | null;
  defaultAspect?: string;
  allowedSkillKeys?: string[];
  tags?: string[];
  summary?: string;
  effectText?: string;
  createdAt: string;
  updatedAt: string;
};

export type CharacterLearnedAbility = {
  abilityId: string;
  abilityKey: string;
  sourceType: "learned" | "innate"; // can be learned through progression or innate to the character (e.g. racial trait)
  notes?: string;
  prepared?: boolean;
};

export type EffectiveAbility = {
  abilityId?: string;
  abilityKey: string;
  name: string;
  category?: AbilityCategory;
  sourceType: "learned" | "innate" | "item";
  sourceLabel?: string;
  sourceInstanceId?: string;
  activation?: AbilityActivation;
  usageModel?: AbilityUsageModel;
  cost?: AbilityCost | null;
  summary?: string;
  effectText?: string;
  available: boolean;
  tags?: string[];
  notes?: string;
  grantMode?: "passive" | "active";
};
