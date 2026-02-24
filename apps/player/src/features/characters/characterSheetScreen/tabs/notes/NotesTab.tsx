import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@tapestry/ui";
import { useDebouncedCallback } from "@/lib/useDebouncedCallback";
import styles from "./NotesTab.module.scss";

type Props = {
  initialNotes: string;
  onSave: (notes: string) => void;
};

export function NotesTab({ initialNotes, onSave }: Props) {
  const [notesDraft, setNotesDraft] = useState(initialNotes);

  useEffect(() => {
    setNotesDraft(initialNotes);
  }, [initialNotes]);

  const debouncedSave = useDebouncedCallback((value: string) => {
    onSave(value);
  }, 650);

  return (
    <Card inlay className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.cardTitle}>Notes</div>
        <div className={styles.cardHint}>Autosaves as you type.</div>
      </CardHeader>
      <CardBody>
        <textarea
          className={styles.notesInput}
          value={notesDraft}
          onChange={(e) => {
            const v = e.target.value;
            setNotesDraft(v);
            debouncedSave.call(v);
          }}
          onBlur={() => debouncedSave.flush()}
          rows={8}
          placeholder="NPC names, clues, debts, vows, loot…"
        />
      </CardBody>
    </Card>
  );
}
