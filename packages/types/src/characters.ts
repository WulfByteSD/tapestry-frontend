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

export type InventoryItem = {
  itemKey?: string;
  sourceId?: string;
  name?: string;
  qty: number;
  tags?: string[];
  notes?: string;
};

export type CharacterSheet = {
  _id: string;
  player: string; // playerId
  campaign?: string | null; // campaignId or null

  name: string;
  avatarUrl?: string | null;

  status: SheetStatus;
  tags: string[];

  sheet: {
    archetypeKey?: string;
    weaveLevel: number;
    aspects: AspectScores;
    skills: Record<string, number>;
    features: string[];
    resources: {
      hp: ResourceTrack;
      threads: ResourceTrack;
      resolve?: ResourceTrack;
      other: Record<string, number>;
    };
    conditions: ConditionInstance[];
    inventory: InventoryItem[];
    notes?: string;
  };

  forkedFrom?: string | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO
};
