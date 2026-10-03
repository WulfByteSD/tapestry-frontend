'use client';

import { useState } from 'react';
import { Button, Input } from '@tapestry/ui';
import { useUpdateCharacterSheetMutation } from './characterSheet.mutations';
import type { CharacterNameProps } from './CharacterName.types';
import styles from './CharacterSheet.module.scss';

export function CharacterNameForm({ characterId, name }: CharacterNameProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const update = useUpdateCharacterSheetMutation(characterId);

  if (!editing) return (
    <h1 className={styles.characterName}>
      <button type="button" onClick={() => { setDraft(name); setEditing(true); }} aria-label={`Edit character name: ${name}`}>
        {name}<span className={styles.editLabel}>Edit name</span>
      </button>
    </h1>
  );

  return (
    <form className={styles.nameForm} onSubmit={(event) => {
      event.preventDefault();
      if (draft.trim()) update.mutate({ name: draft.trim() }, { onSuccess: () => setEditing(false) });
    }} onKeyDown={(event) => { if (event.key === 'Escape' && !update.isPending) setEditing(false); }}>
      <Input label="Character name" autoFocus maxLength={60} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={update.isPending} />
      <div className={styles.inlineActions}>
        <Button type="submit" size="sm" disabled={!draft.trim()} isLoading={update.isPending}>Save name</Button>
        <Button type="button" size="sm" variant="ghost" disabled={update.isPending} onClick={() => setEditing(false)}>Cancel</Button>
      </div>
      {update.isError && <p role="alert" className={styles.errorText}>Name was not saved. Try again.</p>}
    </form>
  );
}
