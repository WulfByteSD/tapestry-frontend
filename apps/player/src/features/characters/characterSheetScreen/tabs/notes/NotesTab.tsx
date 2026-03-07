"use client";

import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import type { NoteCard, NoteCardKind } from "@tapestry/types";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createBlankNote } from "./functions";
import { NoteEditorScreen } from "./editor/NoteEditorScreen";
import { NoteListScreen } from "./list/NoteListScreen";
import { useNoteListState } from "./list/useNoteListState";

type NotesView = "list" | "editor";

type Props = {
  initialNoteCards: NoteCard[];
  onSave: (noteCards: NoteCard[]) => void;
};

export function NotesTab({ initialNoteCards, onSave }: Props) {
  const [cards, setCards] = useState<NoteCard[]>(initialNoteCards ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(initialNoteCards?.[0]?.id ?? null);
  const [view, setView] = useState<NotesView>("list");

  // Must be called at top level, every render.
  const listState = useNoteListState();

  const debouncedSave = useDebouncedCallback((nextCards: NoteCard[]) => {
    onSave(nextCards);
  }, 650);

  useEffect(() => {
    const nextCards = initialNoteCards ?? [];
    setCards(nextCards);

    if (!nextCards.length) {
      setSelectedId(null);
      setView("list");
      return;
    }

    const stillExists = nextCards.some((card) => card.id === selectedId);
    if (!stillExists) {
      setSelectedId(nextCards[0].id);
    }
  }, [initialNoteCards, selectedId]);

  const activeCard = useMemo(() => cards.find((card) => card.id === selectedId) ?? null, [cards, selectedId]);

  function persist(nextCards: NoteCard[], immediate = false) {
    setCards(nextCards);

    if (immediate) {
      debouncedSave.cancel();
      onSave(nextCards);
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
