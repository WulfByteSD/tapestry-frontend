"use client";

import { Button, Card, CardBody, CardHeader, Select } from "@tapestry/ui";
import type { NoteCard, NoteCardKind } from "@tapestry/types";
import { KIND_OPTIONS, nowIso } from "../functions";
import styles from "./NoteEditorScreen.module.scss";

type PersistNotes = (nextCards: NoteCard[], immediate?: boolean) => void;

type Props = {
  card: NoteCard | null;
  cards: NoteCard[];
  persist: PersistNotes;
  onBack: () => void;
  onDeleteComplete: (nextSelectedId: string | null) => void;
};

export function NoteEditorScreen({ card, cards, persist, onBack, onDeleteComplete }: Props) {
  function replaceActiveCard(
    patch: Partial<NoteCard>,
    options?: {
      immediate?: boolean;
      touchUpdatedAt?: boolean;
    },
  ) {
    if (!card) return;

    const immediate = options?.immediate ?? false;
    const touchUpdatedAt = options?.touchUpdatedAt ?? false;

    const nextCards = cards.map((entry) =>
      entry.id === card.id
        ? {
            ...entry,
            ...patch,
            ...(touchUpdatedAt ? { updatedAt: nowIso() } : {}),
          }
        : entry,
    );

    persist(nextCards, immediate);
  }

  function commitActiveCard() {
    if (!card) return;

    const nextCards = cards.map((entry) =>
      entry.id === card.id
        ? {
            ...entry,
            updatedAt: nowIso(),
          }
        : entry,
    );

    persist(nextCards, true);
  }

  function handleBack() {
    if (card) {
      commitActiveCard();
    }
    onBack();
  }

  function handleDelete() {
    if (!card) return;

    const nextCards = cards.filter((entry) => entry.id !== card.id);
    const nextSelectedId = nextCards[0]?.id ?? null;

    persist(nextCards, true);
    onDeleteComplete(nextSelectedId);
  }

  if (!card) {
    return (
      <Card className={styles.screenCard}>
        <CardHeader className={styles.header}>
          <Button size="sm" variant="ghost" onClick={onBack}>
            Back
          </Button>
        </CardHeader>

        <CardBody className={styles.emptyBody}>
          <div className={styles.emptyTitle}>No note selected</div>
          <div className={styles.emptyCopy}>Pick a note from the list or create a new one.</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={styles.screenCard}>
      <CardHeader className={styles.header}>
        <div className={styles.headerRow}>
          <Button size="sm" variant="ghost" onClick={handleBack}>
            Back
          </Button>

          <div className={styles.headerMeta}>
            <div className={styles.headerTitle}>{card.title?.trim() || "Untitled Note"}</div>
            <div className={styles.headerSubtitle}>{card.kind} note</div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => replaceActiveCard({ pinned: !card.pinned }, { immediate: true, touchUpdatedAt: true })}
          >
            {card.pinned ? "Unpin" : "Pin"}
          </Button>

          <Button size="sm" tone="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardHeader>

      <CardBody className={styles.body}>
        <label className={styles.field}>
          <span className={styles.label}>Title</span>
          <input
            className={styles.textInput}
            value={card.title}
            onChange={(e) =>
              replaceActiveCard({ title: e.target.value.slice(0, 80) }, { immediate: false, touchUpdatedAt: false })
            }
            onBlur={commitActiveCard}
            placeholder="Untitled Note"
            maxLength={80}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Kind</span>
          <Select
            className={styles.selectInput}
            value={card.kind}
            onChange={(e) =>
              replaceActiveCard({ kind: e.target.value as NoteCardKind }, { immediate: true, touchUpdatedAt: true })
            }
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Details</span>
          <textarea
            className={styles.textarea}
            value={card.body}
            onChange={(e) => replaceActiveCard({ body: e.target.value }, { immediate: false, touchUpdatedAt: false })}
            onBlur={commitActiveCard}
            rows={18}
            placeholder="Write everything relevant to this thread here..."
          />
        </label>
      </CardBody>
    </Card>
  );
}
