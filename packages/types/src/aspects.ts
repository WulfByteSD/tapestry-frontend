export type AspectGroup = "might" | "finesse" | "wit" | "resolve";

export type AspectKey =
  | "strength"
  | "presence"
  | "agility"
  | "charm"
  | "instinct"
  | "knowledge"
  | "willpower"
  | "empathy";

export const ASPECT_BLOCKS: Array<{
  title: string;
  group: AspectGroup;
  keys: Array<{ label: string; key: AspectKey }>;
}> = [
  {
    title: "Might",
    group: "might",
    keys: [
      { label: "Strength", key: "strength" },
      { label: "Presence", key: "presence" },
    ],
  },
  {
    title: "Finesse",
    group: "finesse",
    keys: [
      { label: "Agility", key: "agility" },
      { label: "Charm", key: "charm" },
    ],
  },
  {
    title: "Wit",
    group: "wit",
    keys: [
      { label: "Instinct", key: "instinct" },
      { label: "Knowledge", key: "knowledge" },
    ],
  },
  {
    title: "Resolve",
    group: "resolve",
    keys: [
      { label: "Willpower", key: "willpower" },
      { label: "Empathy", key: "empathy" },
    ],
  },
];
