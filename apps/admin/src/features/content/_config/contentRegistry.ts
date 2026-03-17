// _config/contentRegistry.ts
export const CONTENT_REGISTRY = {
  setting: {
    label: "Settings",
    mode: "list",
    createDefaults: () => ({
      status: "draft",
      modules: { items: true, lore: true, maps: false, magic: false },
      tags: [],
    }),
  },
  item: {
    label: "Items",
    mode: "list",
    requiresSetting: true,
    createDefaults: (settingKey: string) => ({
      settingKeys: [settingKey],
      status: "draft",
      tags: [],
      attackProfiles: [],
      grantedAbilities: [],
    }),
  },
  skill: {
    label: "Skills",
    mode: "list",
    requiresSetting: true,
    createDefaults: (settingKey: string) => ({
      settingKeys: [settingKey, "shared"],
      status: "draft",
      tags: [],
    }),
  },
  ability: {
    label: "Abilities",
    mode: "list",
    requiresSetting: true,
    createDefaults: (settingKey: string) => ({
      settingKeys: [settingKey],
      status: "draft",
      tags: [],
      allowedSkillKeys: [],
    }),
  },
  lore: {
    label: "Lore",
    mode: "tree",
    requiresSetting: true,
    createDefaults: (settingKey: string, parentId?: string | null) => ({
      settingKey,
      parentId: parentId ?? null,
      status: "draft",
      tags: [],
      relations: [],
      summary: "",
      body: "",
      depth: 0,
      sortOrder: 0,
    }),
  },
} as const;
