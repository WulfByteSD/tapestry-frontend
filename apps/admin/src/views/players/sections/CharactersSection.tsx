'use client';

import { Card, CardBody, CardHeader } from '@tapestry/ui';
import { usePlayerCharacters } from '@/lib/player-admin';
import styles from '../PlayerDetailView.module.scss';

type CharactersSectionProps = {
  playerId: string;
};

export function CharactersSection({ playerId }: CharactersSectionProps) {
  const { data: charactersData } = usePlayerCharacters(playerId, {
    filterOptions: `player;${playerId}`,
  });

  const characters = charactersData?.payload ?? [];

  return (
    <Card className={styles.resourcesCard}>
      <CardHeader>
        <h2>Characters ({characters.length})</h2>
      </CardHeader>
      <CardBody>
        {characters.length === 0 ? (
          <p className={styles.emptyMessage}>No characters created yet.</p>
        ) : (
          <ul className={styles.resourceList}>
            {characters.map((character: any) => (
              <li key={character._id} className={styles.resourceItem}>
                <span className={styles.resourceName}>{character.name || 'Unnamed'}</span>
                <code className={styles.resourceId}>{character._id}</code>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
