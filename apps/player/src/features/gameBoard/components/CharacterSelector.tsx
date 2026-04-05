'use client';

import { Avatar, Button, Modal } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import styles from './CharacterSelector.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  characters: CharacterSheet[];
  activeCharacterId: string | null;
  onSelect: (characterId: string | null) => void;
  playerName: string;
}

/**
 * Modal for selecting which character to act as.
 * Includes "No Character (As Self)" option plus all attached characters.
 */
export default function CharacterSelector({ open, onClose, characters, activeCharacterId, onSelect, playerName }: Props) {
  const handleSelect = (characterId: string | null) => {
    onSelect(characterId);
    onClose();
  };

  // Sort characters alphabetically by name
  const sortedCharacters = [...characters].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Modal open={open} onCancel={onClose} title="Select Character" width={480}>
      <div className={styles.selector}>
        <p className={styles.description}>Choose which character you're acting as, or select "As Self" to take actions without a character.</p>

        <div className={styles.list}>
          {/* "As Self" option */}
          <button type="button" className={[styles.option, activeCharacterId === null ? styles.active : ''].filter(Boolean).join(' ')} onClick={() => handleSelect(null)}>
            <div className={styles.optionAvatar}>
              <Avatar name={playerName} size="md" />
            </div>
            <div className={styles.optionInfo}>
              <p className={styles.optionName}>{playerName}</p>
              <p className={styles.optionMeta}>Acting as self</p>
            </div>
            {activeCharacterId === null && <span className={styles.checkmark}>✓</span>}
          </button>

          {/* Character options */}
          {sortedCharacters.map((char) => {
            const archetype = char.sheet.archetypeKey ?? 'Unknown';
            const level = char.sheet.weaveLevel ?? 1;
            const isActive = activeCharacterId === char._id;

            return (
              <button key={char._id} type="button" className={[styles.option, isActive ? styles.active : ''].filter(Boolean).join(' ')} onClick={() => handleSelect(char._id)}>
                <div className={styles.optionAvatar}>
                  <Avatar src={char.avatarUrl ?? undefined} alt={char.name} size="md" />
                </div>
                <div className={styles.optionInfo}>
                  <p className={styles.optionName}>{char.name}</p>
                  <p className={styles.optionMeta}>
                    {archetype} · Level {level}
                  </p>
                </div>
                {isActive && <span className={styles.checkmark}>✓</span>}
              </button>
            );
          })}

          {/* Empty state */}
          {sortedCharacters.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No characters attached to this campaign.</p>
              <p className={styles.emptyHint}>Visit the Character zone to attach a character.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
