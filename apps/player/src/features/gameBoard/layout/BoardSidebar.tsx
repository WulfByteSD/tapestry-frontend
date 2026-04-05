'use client';

import { useState } from 'react';
import type { CampaignType } from '@tapestry/types';
import { Avatar } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { useProfile } from '@tapestry/hooks/src/useProfile';
import { api } from '@/lib/api';
import { useActiveCharacter } from '../useActiveCharacter';
import { useGameBoardPresence } from '../useGameBoardPresence';
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
  const { isUserOnline } = useGameBoardPresence(campaign._id);

  // Sort members: online first
  const sortedMembers = [...campaign.members].sort((a, b) => {
    const aPlayer = typeof a.player === 'object' ? a.player : null;
    const bPlayer = typeof b.player === 'object' ? b.player : null;
    const aOnline = aPlayer?._id ? isUserOnline(aPlayer._id) : false;
    const bOnline = bPlayer?._id ? isUserOnline(bPlayer._id) : false;

    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  const members = sortedMembers.slice(0, 8);
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
            const online = player?._id ? isUserOnline(player._id) : false;
            return (
              <div className={styles.memberRow} key={player?._id ?? i}>
                <div className={styles.avatarWrapper}>
                  <Avatar src={player?.avatar ?? undefined} alt={player?.displayName ?? 'Member'} name={player?.displayName ?? undefined} size="sm" />
                  {online && <span className={styles.onlineDot} />}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{player?.displayName ?? 'Unknown'}</span>
                  <span className={styles.memberRole}>
                    {m.role}
                    {online && <span className={styles.onlineIndicator}> ● Online</span>}
                  </span>
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
