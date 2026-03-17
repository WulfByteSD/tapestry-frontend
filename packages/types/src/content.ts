// packages/types/src/content.ts
import type { AbilityDefinition } from "./abilities";
import type { GrantedAbilityRef } from "./abilities";
import type { AttackProfile, InventoryCategory } from "./characters";

export type ContentStatus = "draft" | "published" | "archived";
export type ContentEntityType = "setting" | "item" | "skill" | "ability" | "lore";

export type SettingDefinition = {
  _id: string;
  key: string;
  name: string;
  description?: string;
  status: ContentStatus;
  tags?: string[];
  rulesetVersion?: number;
  modules?: {
    items?: boolean;
    lore?: boolean;
    maps?: boolean;
    magic?: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type ItemDefinition = {
  _id: string;
  settingKeys: string[];
  activeSettingKey?: string;
  key: string;
  name: string;
  protection?: number;
  category: InventoryCategory;
  status: ContentStatus;
  tags?: string[];
  equippable?: boolean;
  slot?: string | null;
  stackable?: boolean;
  notes?: string;
  attackProfiles?: AttackProfile[];
  grantedAbilities?: GrantedAbilityRef[];
  createdAt: string;
  updatedAt: string;
};

export type SkillCategory = "social" | "combat" | "technical" | "knowledge" | "survival" | "magic" | "other";

export type SkillDefinition = {
  _id: string;
  key: string;
  name: string;
  status: ContentStatus;
  settingKeys: string[];
  category?: SkillCategory;
  defaultAspect?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoreNodeKind =
  | "region"
  | "nation"
  | "province"
  | "settlement"
  | "district"
  | "landmark"
  | "faction"
  | "npc"
  | "organization"
  | "culture"
  | "religion"
  | "event"
  | "history"
  | "other";

export type LoreRelationType =
  | "located_in"
  | "member_of"
  | "rules"
  | "serves"
  | "allied_with"
  | "enemy_of"
  | "related_to"
  | "appears_in"
  | "originates_from";

export type LoreRelation = {
  type: LoreRelationType;
  targetId: string;
  targetKey?: string;
  label?: string;
  notes?: string;
};

export type LoreNode = {
  _id: string;
  settingKey: string;
  key: string;
  name: string;
  kind: LoreNodeKind;
  status: ContentStatus;
  parentId?: string | null;
  ancestorIds: string[];
  depth: number;
  sortOrder: number;
  tags?: string[];
  summary?: string;
  body?: string;
  relations: LoreRelation[];
  meta?: {
    imageUrl?: string;
    bannerUrl?: string;
    coordinates?: { x: number; y: number } | null;
    regionLabel?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type ContentRecord = SettingDefinition | ItemDefinition | SkillDefinition | AbilityDefinition | LoreNode;
