import type { NoteCard, NoteCardKind } from "@tapestry/types";

export const KIND_OPTIONS: Array<{ value: NoteCardKind; label: string }> = [
  { value: "general", label: "General" },
  { value: "npc", label: "NPC" },
  { value: "quest", label: "Quest" },
  { value: "location", label: "Location" },
  { value: "faction", label: "Faction" },
  { value: "clue", label: "Clue" },
];

export const ALL_KIND = "all";
export const DEFAULT_PAGE_SIZE = 40;

export function nowIso() {
  return new Date().toISOString();
}

export function createBlankNote(kind: NoteCardKind = "general"): NoteCard {
  const stamp = nowIso();

  return {
    id: crypto.randomUUID(),
    title: "Untitled Note",
    body: "",
    kind,
    pinned: false,
    tags: [],
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function sortCards(cards: NoteCard[]) {
  return [...cards].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
