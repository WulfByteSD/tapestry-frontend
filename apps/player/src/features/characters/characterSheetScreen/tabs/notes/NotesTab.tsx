"use client";

import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import type { NoteCard, NoteCardKind } from "@tapestry/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createBlankNote } from "./functions";
import { NoteEditorScreen } from "./editor/NoteEditorScreen";
import { NoteListScreen } from "./list/NoteListScreen";
import { useNoteListState } from "./list/useNoteListState";

function normalizeCards(cards: NoteCard[]) {
  return cards.map((card) => ({ ...card, isPrivate: card.isPrivate !== false }));
}

function sameCardContents(left: NoteCard[], right: NoteCard[]) {
  const contents = (entries: NoteCard[]) => entries.map((entry) => ({ ...entry, updatedAt: undefined }));
  return JSON.stringify(contents(left)) === JSON.stringify(contents(right));
}

type NotesView = "list" | "editor";

type Props = {
  initialNoteCards: NoteCard[];
  onSave: (noteCards: NoteCard[]) => Promise<void>;
};

export function NotesTab({ initialNoteCards, onSave }: Props) {
  const [cards, setCards] = useState<NoteCard[]>(initialNoteCards ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(initialNoteCards?.[0]?.id ?? null);
  const [view, setView] = useState<NotesView>("list");

  const hasUnsentEdits = useRef(false);
  const pendingSaves = useRef(0);
  const saveRevision = useRef(0);
  const latestCards = useRef(initialNoteCards ?? []);

  // Must be called at top level, every render.
  const listState = useNoteListState();

  async function sendCards(nextCards: NoteCard[]) {
    const revision = ++saveRevision.current;
    hasUnsentEdits.current = false;
    pendingSaves.current += 1;
    try {
      await onSave(nextCards);
    } catch {
      if (revision === saveRevision.current) hasUnsentEdits.current = true;
    } finally {
      pendingSaves.current -= 1;
    }
  }

  const debouncedSave = useDebouncedCallback((nextCards: NoteCard[]) => {
    void sendCards(nextCards);
  }, 650);

  useEffect(() => {
    const nextCards = normalizeCards(initialNoteCards ?? []);
    // Debounced edits and queued requests must survive older server responses.
    if (hasUnsentEdits.current || pendingSaves.current) return;
    latestCards.current = nextCards;
    setCards(nextCards);
    setSelectedId((current) => nextCards.some((card) => card.id === current) ? current : nextCards[0]?.id ?? null);
    if (!nextCards.length) setView("list");
  }, [initialNoteCards]);

  const { flush } = debouncedSave;
  useEffect(() => () => flush(), [flush]);

  const activeCard = useMemo(() => cards.find((card) => card.id === selectedId) ?? null, [cards, selectedId]);

  function persist(nextCards: NoteCard[], immediate = false) {
    nextCards = normalizeCards(nextCards);
    // Blur followed by Back commits the same content twice with a new timestamp.
    if (sameCardContents(nextCards, latestCards.current) && !hasUnsentEdits.current) return;
    hasUnsentEdits.current = !immediate;
    latestCards.current = nextCards;
    setCards(nextCards);

    if (immediate) {
      debouncedSave.cancel();
      void sendCards(nextCards);
      return;
    }

    debouncedSave.call(nextCards);
  }

  function handleCreate(kind: NoteCardKind = "general") {
    const newCard = createBlankNote(kind);
    const nextCards = [newCard, ...cards];
    setSelectedId(newCard.id);
    persist(nextCards, true);
    setView("editor");
  }

  function handleOpen(cardId: string) {
    setSelectedId(cardId);
    setView("editor");
  }

  function handleBackToList() {
    setView("list");
  }

  return (
    <AnimatePresence mode="wait">
      {view === "editor" ? (
        <motion.div
          key="editor"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <NoteEditorScreen
            card={activeCard}
            cards={cards}
            persist={persist}
            onBack={handleBackToList}
            onDeleteComplete={(nextSelectedId) => {
              setSelectedId(nextSelectedId);
              setView("list");
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <NoteListScreen
            cards={cards}
            selectedId={selectedId}
            onCreate={handleCreate}
            onOpen={handleOpen}
            state={listState}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
