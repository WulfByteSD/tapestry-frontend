import type { NoteCard, NoteCardKind } from "@tapestry/types";
import { ALL_KIND, sortCards } from "../functions";

export function matchesSearch(card: NoteCard, query: string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();

  return (
    card.title.toLowerCase().includes(q) ||
    card.body.toLowerCase().includes(q) ||
    card.kind.toLowerCase().includes(q) ||
    (card.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
  );
}

export function filterCards(
  cards: NoteCard[],
  args: {
    query: string;
    kindFilter: NoteCardKind | typeof ALL_KIND;
    pinnedOnly: boolean;
  },
) {
  const sorted = sortCards(cards);

  return sorted.filter((card) => {
    if (args.pinnedOnly && !card.pinned) return false;
    if (args.kindFilter !== ALL_KIND && card.kind !== args.kindFilter) return false;
    if (!matchesSearch(card, args.query)) return false;
    return true;
  });
}
