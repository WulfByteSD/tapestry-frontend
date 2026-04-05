'use client';

import { useState } from 'react';
import type { CampaignType } from '@tapestry/types';
import { Avatar } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { useProfile } from '@tapestry/hooks/src/useProfile';
import { api } from '@/lib/api';
import { useActiveCharacter } from '../useActiveCharacter';
import CharacterSnapshot from '../components/CharacterSnapshot';
import CharacterSelector from '../components/CharacterSelector';
import styles from './BoardSidebar.module.scss';

type Props = {
  campaign: CampaignType;
  isSW: boolean;
};

export default function BoardSidebar({ campaign, isSW }: Props) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { data: currentUser } = useMe();
  const { data: playerProfile } = useProfile(api, currentUser, 'player');

  const currentUserId = playerProfile?.payload?._id;
  const { activeCharacterId, activeCharacter, setActiveCharacter, isLoading, characters } = useActiveCharacter(campaign._id, currentUserId, isSW);

  const members = campaign.members.slice(0, 8);
  const playerName = playerProfile?.payload?.displayName ?? 'Player';

  return (
    <div className={styles.sidebar}>
      {/* Character Snapshot panel */}
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Your Character</h3>
        <CharacterSnapshot activeCharacter={activeCharacter} playerName={playerName} isLoading={isLoading} onClick={() => setSelectorOpen(true)} />
      </section>

      {/* Party Members panel */}
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Party ({campaign.members.length})</h3>
        <div className={styles.memberList}>
          {members.map((m, i) => {
            const player = typeof m.player === 'object' ? m.player : null;
            return (
              <div className={styles.memberRow} key={player?._id ?? i}>
                <Avatar src={player?.avatar ?? undefined} alt={player?.displayName ?? 'Member'} name={player?.displayName ?? undefined} size="sm" />
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{player?.displayName ?? 'Unknown'}</span>
                  <span className={styles.memberRole}>{m.role}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Actions panel — stub */}
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Quick Actions</h3>
        <div className={styles.actionStubs}>
          <div className={styles.actionStub}>🎲 Roll Dice</div>
          {isSW && <div className={styles.actionStub}>⚔️ Start Encounter</div>}
          <div className={styles.actionStub}>📝 Quick Note</div>
        </div>
      </section>
      {/* Character Selector Modal */}
      <CharacterSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        characters={characters}
        activeCharacterId={activeCharacterId}
        onSelect={setActiveCharacter}
        playerName={playerName}
      />
    </div>
  );
}
