import { CharacterLearnedAbility, EffectiveAbility, GrantedAbilityRef } from "./abilities";

export type SheetStatus = "active" | "archived";

export type AspectScores = {
  might: { strength: number; presence: number };
  finesse: { agility: number; charm: number };
  wit: { instinct: number; knowledge: number };
  resolve: { willpower: number; empathy: number };
};

export type ResourceTrack = { current: number; max: number; temp?: number };

export type ConditionInstance = {
  key: string;
  stacks?: number;
  appliedAt?: string; // ISO
  expiresAt?: string | null;
  source?: string;
  notes?: string;
};
export type InventoryCategory = "weapon" | "armor" | "gear" | "consumable" | "tool" | "currency" | "quest" | "other";

export type AttackKind = "melee" | "ranged" | "spell" | "special";

export type AttackProfile = {
  key: string;
  name: string;
  attackKind?: AttackKind;
  defaultAspect?: string;
  allowedSkillKeys?: string[];
  modifier?: number;
  harm?: number | string;
  rangeLabel?: string;
  tags?: string[];
  notes?: string;
};

export type ItemDefinitionRef = {
  itemKey: string;
  sourceId?: string;
  settingKey?: string;
  version?: number;
};

export type InventoryItem = {
  instanceId?: string;
  definition?: ItemDefinitionRef;
  itemKey?: string;
  sourceId?: string;
  name?: string;
  protection?: number;
  addedFromSettingKey?: string;
  qty: number;
  stackable?: boolean;
  tags?: string[];
  notes?: string;
  category?: InventoryCategory;
  equipped?: boolean;
  slot?: string;
  attackProfiles?: AttackProfile[];
  selectedAttackProfileKey?: string;
  grantedAbilities?: GrantedAbilityRef[];
  overrides?: {
    displayName?: string;
    modifier?: number;
    protection?: number;
    harm?: number | string;
    tags?: string[];
  };
};

export type CharacterProfile = {
  title?: string;
  bio?: string;

  race?: string;
  nationality?: string;
  religion?: string;
  sex?: string;

  height?: string;
  weight?: string;
  eyes?: string;
  hair?: string;
  ethnicity?: string;
  age?: number | string;

  extra?: Record<string, string>;
};
export type NoteCardKind = "general" | "npc" | "quest" | "location" | "faction" | "clue";

export type NoteCard = {
  id: string;
  title: string;
  body: string;
  kind: NoteCardKind;
  pinned?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};
export type CharacterSheet = {
  _id: string;
  player: string;
  campaign?: string | null;
  name: string;
  avatarUrl?: string | null;
  status: SheetStatus;
  tags: string[];

  settingKey?: string;
  toneModules?: string[];
  rulesetVersion?: number;

  sheet: {
    archetypeKey?: string;
    weaveLevel: number;
    profile?: CharacterProfile;
    aspects: AspectScores;
    skills: Record<string, number>;
    features: string[];
    resources: {
      hp: ResourceTrack;
      threads: ResourceTrack;
      resolve?: ResourceTrack;
      other: Record<string, number>;
    };
    learnedAbilities: CharacterLearnedAbility[];
    conditions: ConditionInstance[];
    inventory: InventoryItem[];
    noteCards: NoteCard[];
  };
  derived?: {
    effectiveAbilities?: EffectiveAbility[];
  };
  forkedFrom?: string | null;
  createdAt: string;
  updatedAt: string;
};
