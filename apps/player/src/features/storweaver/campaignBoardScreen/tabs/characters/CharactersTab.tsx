import type { CampaignType } from "@tapestry/types";
import styles from "./CharactersTab.module.scss";
import { Card } from "@tapestry/ui";

type Props = {
  campaign: CampaignType & { _id: string };
};

// TODO: This will be replaced with actual character query hook
// For now, showing a placeholder until the character query is implemented
export function CharactersTab({ campaign }: Props) {
  // TODO: useCharactersQuery(campaign._id)
  const characters: any[] = [];

  if (characters.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>No characters yet</h3>
        <p>Characters linked to this campaign will appear here.</p>
        <p className={styles.hint}>Players join campaigns through the LFG/Games section.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <strong>{characters.length}</strong> {characters.length === 1 ? "character" : "characters"}
      </div>

      <div className={styles.grid}>
        {characters.map((character: any) => (
          <Card key={character._id} className={styles.characterCard}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {character.avatar ? (
                  <img src={character.avatar} alt={character.name} />
                ) : (
                  <div className={styles.avatarFallback}>{character.name[0].toUpperCase()}</div>
                )}
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.characterName}>{character.name}</div>
                <div className={styles.playerName}>{character.playerName || "Unknown Player"}</div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Level</span>
                <span className={styles.statValue}>{character.level || 1}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Archetype</span>
                <span className={styles.statValue}>{character.archetype || "None"}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
