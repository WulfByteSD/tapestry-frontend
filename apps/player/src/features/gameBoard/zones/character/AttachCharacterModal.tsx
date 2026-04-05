'use client';

import { useState } from 'react';
import { Modal, Avatar } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import { useCharacterSheetsQuery } from '@/lib/character-hooks';
import styles from './character.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  /** IDs of characters already attached to this campaign — excluded from the picker. */
  attachedIds: string[];
  /** Called with the chosen character + optional message */
  onSubmit: (characterId: string, message?: string) => void;
  isSubmitting?: boolean;
  /** If true, skip message field (SW directly attaches DMPC) */
  isDMPC?: boolean;
  /** ID of the player whose characters to show */
  playerId: string;
}

export default function AttachCharacterModal({ open, onClose, attachedIds, onSubmit, isSubmitting, isDMPC, playerId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const { data: sheetsResponse, isLoading } = useCharacterSheetsQuery({
    filterOptions: `playerId;${playerId}`,
  });
  const allSheets = (sheetsResponse?.payload ?? []) as CharacterSheet[];

  // Filter: unattached characters only (campaign is null/undefined)
  const availableSheets = allSheets.filter((s) => !s.campaign && !attachedIds.includes(s._id));

  function handleOk() {
    if (!selectedId) return;
    onSubmit(selectedId, isDMPC ? undefined : message.trim() || undefined);
    setSelectedId(null);
    setMessage('');
  }

  function handleCancel() {
    setSelectedId(null);
    setMessage('');
    onClose();
  }

  return (
    <Modal
      open={open}
      title={isDMPC ? 'Attach DMPC Character' : 'Attach a Character'}
      onCancel={handleCancel}
      onOk={handleOk}
      okText={isDMPC ? 'Attach Directly' : 'Submit for Approval'}
      okButtonProps={{ tone: 'gold', disabled: !selectedId }}
      confirmLoading={isSubmitting}
      destroyOnClose
    >
      {isLoading ? (
        <p className={styles.emptySheets}>Loading characters…</p>
      ) : availableSheets.length === 0 ? (
        <p className={styles.emptySheets}>{allSheets.length === 0 ? 'You have no character sheets yet.' : 'All your characters are already attached to a campaign.'}</p>
      ) : (
        <div className={styles.sheetList}>
          {availableSheets.map((sheet) => (
            <button
              key={sheet._id}
              type="button"
              className={[styles.sheetOption, selectedId === sheet._id ? styles.selected : ''].filter(Boolean).join(' ')}
              onClick={() => setSelectedId(sheet._id)}
            >
              <Avatar src={sheet.avatarUrl ?? undefined} alt={sheet.name} size="sm" />
              <div className={styles.sheetOptionInfo}>
                <p className={styles.sheetOptionName}>{sheet.name}</p>
                <p className={styles.sheetOptionMeta}>
                  {sheet.sheet.archetypeKey ?? 'Unknown Archetype'} · Level {sheet.sheet.weaveLevel}
                </p>
              </div>
              {selectedId === sheet._id && (
                <span className={styles.sheetOptionCheck} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {!isDMPC && availableSheets.length > 0 && (
        <>
          <p className={styles.messageLabel}>Note to Storyweaver (optional)</p>
          <textarea
            className={styles.messageInput}
            rows={3}
            placeholder="Tell the Storyweaver a bit about your character…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
        </>
      )}
    </Modal>
  );
}
