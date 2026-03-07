// tabs/notes/list/NoteListScreen.tsx
"use client";

import { useDeferredValue, useMemo } from "react";
import { Button, Card, CardBody, CardHeader, Select } from "@tapestry/ui";
import type { NoteCard, NoteCardKind } from "@tapestry/types";
import { ALL_KIND, DEFAULT_PAGE_SIZE, KIND_OPTIONS } from "../functions";
import type { NoteListState } from "./useNoteListState";
import { filterCards } from "./noteList.helpers";
import styles from "./NoteListScreen.module.scss";

type Props = {
  cards: NoteCard[];
  selectedId: string | null;
  state: NoteListState;
  onCreate: (kind?: NoteCardKind) => void;
  onOpen: (cardId: string) => void;
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function NoteListScreen({ cards, selectedId, state, onCreate, onOpen }: Props) {
  const deferredSearchQuery = useDeferredValue(state.searchQuery);

  const filteredCards = useMemo(() => {
    return filterCards(cards, {
      query: deferredSearchQuery,
      kindFilter: state.kindFilter,
      pinnedOnly: state.pinnedOnly,
    });
  }, [cards, deferredSearchQuery, state.kindFilter, state.pinnedOnly]);

  const visibleCards = useMemo(() => {
    return filteredCards.slice(0, state.visibleCount);
  }, [filteredCards, state.visibleCount]);

  const hasMore = visibleCards.length < filteredCards.length;

  return (
    <Card className={styles.screenCard}>
      <CardHeader className={styles.header}>
        <div>
          <div className={styles.title}>Notes</div>
          <div className={styles.subtitle}>Searchable note cards for NPCs, clues, quests, and campaign chaos.</div>
        </div>

        <Button size="sm" onClick={() => onCreate("general")}>
          Add Note
        </Button>
      </CardHeader>

      <CardBody className={styles.body}>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            value={state.searchQuery}
            onChange={(e) => state.setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            inputMode="search"
          />

          <div className={styles.filterRow}>
            <Select
              className={styles.kindSelect}
              value={state.kindFilter}
              onChange={(e) => state.setKindFilter(e.target.value as NoteCardKind | typeof ALL_KIND)}
            >
              <option value={ALL_KIND}>All Types</option>
              {KIND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={state.pinnedOnly}
                onChange={(e) => state.setPinnedOnly(e.target.checked)}
              />
              <span>Pinned</span>
            </label>
          </div>
        </div>

        <div className={styles.resultsMeta}>
          Showing {visibleCards.length} of {filteredCards.length} notes
        </div>

        {filteredCards.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No notes match these filters.</p>

            <div className={styles.emptyActions}>
              <Button size="sm" variant="ghost" onClick={state.clearFilters}>
                Clear Filters
              </Button>
              <Button size="sm" onClick={() => onCreate("npc")}>
                New NPC Note
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.noteList}>
              {visibleCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`${styles.noteCard} ${card.id === selectedId ? styles.noteCardActive : ""}`}
                  onClick={() => onOpen(card.id)}
                >
                  <div className={styles.noteCardTop}>
                    <span className={styles.kindChip}>{card.kind}</span>
                    {card.pinned ? <span className={styles.pinnedBadge}>Pinned</span> : null}
                  </div>

                  <div className={styles.noteTitle}>{card.title?.trim() || "Untitled Note"}</div>

                  <div className={styles.notePreview}>{card.body?.trim() || "No details yet."}</div>

                  <div className={styles.noteMeta}>Updated {formatUpdatedAt(card.updatedAt)}</div>
                </button>
              ))}
            </div>

            {hasMore ? (
              <div className={styles.loadMoreRow}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => state.setVisibleCount((count) => count + DEFAULT_PAGE_SIZE)}
                >
                  Load More
                </Button>
              </div>
            ) : null}
          </>
        )}
      </CardBody>
    </Card>
  );
}
