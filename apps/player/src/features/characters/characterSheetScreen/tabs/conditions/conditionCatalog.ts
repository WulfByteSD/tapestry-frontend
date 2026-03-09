// apps/player/src/features/characters/characterSheetScreen/tabs/conditions/conditionCatalog.ts

export type ConditionAspectGroup = "might" | "finesse" | "wit" | "resolve";

export type ConditionAspectKey =
  | "strength"
  | "presence"
  | "agility"
  | "charm"
  | "instinct"
  | "knowledge"
  | "willpower"
  | "empathy";

export type ConditionDefinition = {
  key: string;
  name: string;
  summary: string;
  tags: string[];
  suggestedEffects?: {
    burdenOnAllChecks?: boolean;
    burdenOnAttacks?: boolean;
    edgeAgainstYou?: boolean;
    meleeAttackersGainEdge?: boolean;
    movementZero?: boolean;
    ongoingHarm?: number;
    rollPenalty?: number;
    aspectAdjustments?: Array<{
      group: ConditionAspectGroup;
      key: ConditionAspectKey;
      delta: number;
    }>;
  };
};

export const CONDITION_DEFINITIONS: ConditionDefinition[] = [
  {
    key: "exposed",
    name: "Exposed",
    summary: "Enemies gain Edge when attacking you until you recover or reposition.",
    tags: ["combat", "pressure"],
    suggestedEffects: {
      edgeAgainstYou: true,
    },
  },
  {
    key: "grappled",
    name: "Grappled",
    summary: "Your movement is restricted. You may still act, but your Move is 0 until you break free.",
    tags: ["control", "movement"],
    suggestedEffects: {
      movementZero: true,
      burdenOnAllChecks: true,
    },
  },
  {
    key: "fatigued",
    name: "Fatigued",
    summary: "You are worn down. Roll at Burden on your next action.",
    tags: ["strain", "tempo"],
    suggestedEffects: {
      burdenOnAllChecks: true,
    },
  },
  {
    key: "poisoned",
    name: "Poisoned",
    summary: "Toxic effects sap your strength. You take harm over time until treated.",
    tags: ["harm", "toxin"],
    suggestedEffects: {
      ongoingHarm: 1,
      aspectAdjustments: [{ group: "might", key: "strength", delta: -1 }],
    },
  },
  {
    key: "bleeding",
    name: "Bleeding",
    summary: "You take harm whenever you act until the bleeding is treated.",
    tags: ["harm", "injury"],
    suggestedEffects: {
      ongoingHarm: 1,
    },
  },
  {
    key: "disoriented",
    name: "Disoriented",
    summary: "Your senses are scrambled. All rolls suffer a penalty until you recover.",
    tags: ["mental", "debuff"],
    suggestedEffects: {
      rollPenalty: -2,
      burdenOnAllChecks: true,
    },
  },
  {
    key: "frightened",
    name: "Frightened",
    summary: "You hesitate before the source of fear and struggle to advance against it.",
    tags: ["mental", "fear"],
    suggestedEffects: {
      burdenOnAllChecks: true,
    },
  },
  {
    key: "prone",
    name: "Prone",
    summary: "You are on the ground. Standing costs movement, and nearby attackers gain Edge.",
    tags: ["movement", "combat"],
    suggestedEffects: {
      meleeAttackersGainEdge: true,
    },
  },
  {
    key: "weakened-strength",
    name: "Weakened (Strength)",
    summary: "Your physical force is diminished. Strength rolls suffer a penalty.",
    tags: ["debuff", "aspect"],
    suggestedEffects: {
      aspectAdjustments: [{ group: "might", key: "strength", delta: -2 }],
    },
  },
];

export const CONDITION_DEFINITION_MAP = new Map(
  CONDITION_DEFINITIONS.map((condition) => [condition.key, condition])
);