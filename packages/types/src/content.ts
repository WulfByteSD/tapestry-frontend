// packages/types/src/content.ts
import type { AbilityDefinition } from './abilities';
import type { GrantedAbilityRef } from './abilities';
import type { AttackProfile, InventoryCategory } from './characters';

export type ContentStatus = 'draft' | 'published' | 'archived';
export type ContentEntityType = 'setting' | 'item' | 'skill' | 'ability' | 'lore';

export type ItemSlot = 'head' | 'body' | 'legs' | 'feet' | 'hands' | 'weapon' | 'shield' | 'accessory' | 'consumable' | 'other';

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
  imageUrl?: string;
  tags?: string[];
  equippable?: boolean;
  slot?: ItemSlot | null;
  stackable?: boolean;
  notes?: string;
  attackProfiles?: AttackProfile[];
  grantedAbilities?: GrantedAbilityRef[];
  createdAt: string;
  updatedAt: string;
};

export type SkillCategory = 'social' | 'combat' | 'technical' | 'knowledge' | 'survival' | 'magic' | 'other';

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
  | 'region'
  | 'nation'
  | 'province'
  | 'settlement'
  | 'district'
  | 'landmark'
  | 'faction'
  | 'npc'
  | 'organization'
  | 'culture'
  | 'religion'
  | 'event'
  | 'history'
  | 'other';

export type LoreRelationType =
  | 'allied_with'
  | 'ancestor_of'
  | 'appears_in'
  | 'at_foot_of'
  | 'banished_by'
  | 'betrayed_by'
  | 'blessed_by'
  | 'borders'
  | 'bound_to'
  | 'child_of'
  | 'contains'
  | 'created_by'
  | 'cursed_by'
  | 'defends'
  | 'descended_from'
  | 'destroyed_by'
  | 'enemy_of'
  | 'employed_by'
  | 'fears'
  | 'founded_by'
  | 'governs'
  | 'guards'
  | 'hunts'
  | 'imprisoned_by'
  | 'influences'
  | 'inspired_by'
  | 'leads'
  | 'located_in'
  | 'loyal_to'
  | 'member_of'
  | 'mentor_of'
  | 'neighbor_of'
  | 'nominally_loyal_to'
  | 'opposed_to'
  | 'originates_from'
  | 'owns'
  | 'parent_of'
  | 'part_of'
  | 'prophesied_about'
  | 'protected_by'
  | 'related_to'
  | 'rescued_by'
  | 'rival_of'
  | 'rules'
  | 'sealed_by'
  | 'seeks'
  | 'serves'
  | 'shadowed_by'
  | 'sibling_of'
  | 'spouse_of'
  | 'student_of'
  | 'subject_of'
  | 'summoned_by'
  | 'supports'
  | 'trades_with'
  | 'transformed_from'
  | 'under_claim_of'
  | 'witnessed_by'
  | 'worships';

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
