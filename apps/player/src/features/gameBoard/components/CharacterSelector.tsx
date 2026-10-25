'use client';

import { useEffect, useId, useRef } from 'react';
import { Avatar, Button } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import { TbCheck } from 'react-icons/tb';
import styles from './CharacterSelector.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  characters: CharacterSheet[];
  activeCharacterId: string | null;
  onSelect: (characterId: string | null) => void;
  playerName: string;
}

export default function CharacterSelector({ open, onClose, characters, activeCharacterId, onSelect, playerName }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleSelect = (characterId: string | null) => {
    onSelect(characterId);
    onClose();
  };
  const sortedCharacters = [...characters].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={(event) => {
        if (event.target !== event.currentTarget) return;
        onClose();
        openerRef.current?.focus();
      }}
    >
      <div className={styles.header}>
        <h2 id={titleId}>Choose character</h2>
        <Button type="button" variant="outline" tone="gold" autoFocus onClick={onClose}>Close</Button>
      </div>
      <div className={styles.selector}>
        <p className={styles.description}>Choose who you’re acting as at this table. Your selection takes effect immediately.</p>
        <div className={styles.list}>
          <button type="button" aria-pressed={activeCharacterId === null} className={`${styles.option} ${activeCharacterId === null ? styles.active : ''}`} onClick={() => handleSelect(null)}>
            <Avatar name={playerName} size="md" />
            <div className={styles.optionInfo}>
              <p className={styles.optionName}>{playerName}</p>
              <p className={styles.optionMeta}>Acting as self</p>
            </div>
            {activeCharacterId === null ? <TbCheck className={styles.checkmark} size={21} aria-hidden /> : null}
          </button>
          {sortedCharacters.map((character) => {
            const isActive = activeCharacterId === character._id;
            return (
              <button key={character._id} type="button" aria-pressed={isActive} className={`${styles.option} ${isActive ? styles.active : ''}`} onClick={() => handleSelect(character._id)}>
                <Avatar src={character.avatarUrl ?? undefined} alt={character.name} size="md" />
                <div className={styles.optionInfo}>
                  <p className={styles.optionName}>{character.name}</p>
                  <p className={styles.optionMeta}>{character.sheet.archetypeKey ?? 'Unknown'} · Level {character.sheet.weaveLevel ?? 1}</p>
                </div>
                {isActive ? <TbCheck className={styles.checkmark} size={21} aria-hidden /> : null}
              </button>
            );
          })}
          {sortedCharacters.length === 0 ? (
            <p className={styles.empty}>No characters are available to you in this campaign. Visit the Character zone to attach a character.</p>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
