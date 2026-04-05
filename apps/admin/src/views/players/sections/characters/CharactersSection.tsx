'use client';

import { useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, useAlert } from '@tapestry/ui';
import type { CharacterSheet } from '@tapestry/types';
import { usePlayerCharacters, useAdminDeleteCharacter } from '@/lib/player-admin';
import AdminCharacterCard from './AdminCharacterCard.component';
import DeleteCharacterModal from './DeleteCharacterModal.component';
import styles from './CharactersSection.module.scss';

type CharactersSectionProps = {
  playerId: string;
};

type DeleteTarget = { id: string; name: string } | null;

export function CharactersSection({ playerId }: CharactersSectionProps) {
  const { data: charactersData } = usePlayerCharacters(playerId, {
    filterOptions: `player;${playerId}`,
  });
  const characters: CharacterSheet[] = charactersData?.payload ?? [];
  const deleteMutation = useAdminDeleteCharacter(playerId);
  const { addAlert } = useAlert();

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const handleRequestDelete = useCallback((id: string, name: string) => {
    setDeleteTarget({ id, name });
  }, []);

  const handleConfirmDelete = useCallback(
    async (characterId: string) => {
      try {
        await deleteMutation.mutateAsync(characterId);
        addAlert({ type: 'success', message: 'Character deleted successfully.' });
        setDeleteTarget(null);
      } catch {
        addAlert({ type: 'error', message: 'Failed to delete character.' });
      }
    },
    [deleteMutation, addAlert]
  );

  const handleCloseModal = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return (
    <>
      <Card className={styles.sectionCard}>
        <CardHeader>
          <h2>Characters ({characters.length})</h2>
        </CardHeader>
        <CardBody>
          {characters.length === 0 ? (
            <p className={styles.emptyMessage}>No characters created yet.</p>
          ) : (
            <div className={styles.cardGrid}>
              {characters.map((character) => (
                <AdminCharacterCard key={character._id} character={character} onDelete={handleRequestDelete} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {deleteTarget && (
        <DeleteCharacterModal
          open
          characterId={deleteTarget.id}
          characterName={deleteTarget.name}
          loading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
