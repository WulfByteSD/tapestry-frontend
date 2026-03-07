import type { AttackProfile, InventoryCategory } from "./characters";

export type ContentStatus = "draft" | "published" | "archived";

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
  settingKey: string;
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
  createdAt: string;
  updatedAt: string;
};

export type SkillCategory = "social" | "combat" | "technical" | "knowledge" | "survival" | "magic" | "other";

export type SkillDefinition = {
  key: string;
  name: string;
  status: "draft" | "published" | "archived";
  settingKeys: string[];
  category?: SkillCategory;
  defaultAspect?: string;
  tags: string[];
  notes?: string;
};
