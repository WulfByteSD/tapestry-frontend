"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@tapestry/ui";
import type { NoteCard, NoteCardKind } from "@tapestry/types";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import styles from "./NotesTab.module.scss";

type Props = {
  initialNoteCards: NoteCard[];
  onSave: (noteCards: NoteCard[]) => void;
};

const KIND_OPTIONS: Array<{ value: NoteCardKind; label: string }> = [
  { value: "general", label: "General" },
  { value: "npc", label: "NPC" },
  { value: "quest", label: "Quest" },
  { value: "location", label: "Location" },
  { value: "faction", label: "Faction" },
  { value: "clue", label: "Clue" },
];

function nowIso() {
  return new Date().toISOString();
}

function createBlankNote(kind: NoteCardKind = "general"): NoteCard {
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

function sortCards(cards: NoteCard[]) {
  return [...cards].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function NotesTab({ initialNoteCards, onSave }: Props) {
  const [cards, setCards] = useState<NoteCard[]>(initialNoteCards ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(initialNoteCards?.[0]?.id ?? null);

  useEffect(() => {
    const nextCards = initialNoteCards ?? [];
    setCards(nextCards);

    if (!nextCards.length) {
      setSelectedId(null);
      return;
    }

    const stillExists = nextCards.some((card) => card.id === selectedId);
    if (!stillExists) {
      setSelectedId(nextCards[0].id);
    }
  }, [initialNoteCards, selectedId]);

  const debouncedSave = useDebouncedCallback((next: NoteCard[]) => {
    onSave(next);
  }, 650);

  const orderedCards = useMemo(() => sortCards(cards), [cards]);
  const activeCard = orderedCards.find((card) => card.id === selectedId) ?? null;

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
  }

  function handleDelete(cardId: string) {
    const nextCards = cards.filter((card) => card.id !== cardId);
    const nextSelected = selectedId === cardId ? (nextCards[0]?.id ?? null) : selectedId;

    setSelectedId(nextSelected);
    persist(nextCards, true);
  }

  function updateCard(cardId: string, patch: Partial<NoteCard>) {
    const nextCards = cards.map((card) =>
      card.id === cardId
        ? {
            ...card,
            ...patch,
            updatedAt: nowIso(),
          }
        : card,
    );

    persist(nextCards);
  }

  return (
    <div className={styles.layout}>
      <Card className={styles.sidebarCard}>
        <CardHeader className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>Notes</div>
            <div className={styles.cardHint}>Organized note cards for NPCs, clues, quests, and more.</div>
          </div>

          <Button size="sm" onClick={() => handleCreate()}>
            Add Note
          </Button>
        </CardHeader>

        <CardBody className={styles.sidebarBody}>
          {orderedCards.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No notes yet.</p>
              <p>Start with an NPC, clue, or quest thread.</p>

              <div className={styles.emptyActions}>
                <Button size="sm" onClick={() => handleCreate("npc")}>
                  New NPC Note
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleCreate("quest")}>
                  New Quest Note
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.noteList}>
              {orderedCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={`${styles.noteListItem} ${card.id === selectedId ? styles.noteListItemActive : ""}`}
                  onClick={() => setSelectedId(card.id)}
                >
                  <div className={styles.noteListTopRow}>
                    <span className={styles.noteKind}>{card.kind}</span>
                    {card.pinned ? <span className={styles.notePinned}>Pinned</span> : null}
                  </div>

                  <div className={styles.noteTitle}>{card.title || "Untitled Note"}</div>
                  <div className={styles.notePreview}>{card.body?.trim() || "No details yet."}</div>
                </button>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className={styles.editorCard}>
        <CardHeader className={styles.cardHeader}>
          <div>
            <div className={styles.cardTitle}>{activeCard ? "Edit Note" : "No Note Selected"}</div>
            <div className={styles.cardHint}>Autosaves as you type.</div>
          </div>

          {activeCard ? (
            <div className={styles.editorActions}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCard(activeCard.id, { pinned: !activeCard.pinned })}
              >
                {activeCard.pinned ? "Unpin" : "Pin"}
              </Button>

              <Button size="sm" tone="danger" onClick={() => handleDelete(activeCard.id)}>
                Delete
              </Button>
            </div>
          ) : null}
        </CardHeader>

        <CardBody className={styles.editorBody}>
          {!activeCard ? (
            <div className={styles.emptyEditor}>Select a note or create a new one.</div>
          ) : (
            <>
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  <span className={styles.label}>Title</span>
                  <input
                    className={styles.textInput}
                    value={activeCard.title}
                    onChange={(e) =>
                      updateCard(activeCard.id, {
                        title: e.target.value.slice(0, 80),
                      })
                    }
                    onBlur={() => debouncedSave.flush()}
                    placeholder="Lady Mara, Missing Crown, Sewer Entrance..."
                    maxLength={80}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Kind</span>
                  <select
                    className={styles.selectInput}
                    value={activeCard.kind}
                    onChange={(e) =>
                      updateCard(activeCard.id, {
                        kind: e.target.value as NoteCardKind,
                      })
                    }
                    onBlur={() => debouncedSave.flush()}
                  >
                    {KIND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>Details</span>
                <textarea
                  className={styles.notesInput}
                  value={activeCard.body}
                  onChange={(e) => updateCard(activeCard.id, { body: e.target.value })}
                  onBlur={() => debouncedSave.flush()}
                  rows={16}
                  placeholder="Write everything relevant to this thread here..."
                />
              </label>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
