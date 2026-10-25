'use client';

import { useState } from 'react';
import type { CampaignType } from '@tapestry/types';
import { Avatar } from '@tapestry/ui';
import { TbDice, TbNotebook, TbSwords } from 'react-icons/tb';
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
  const roleNames = { sw: 'Storyweaver', 'co-sw': 'Co-Storyweaver', player: 'Player', observer: 'Observer' };

  return (
    <div className={styles.sidebar}>
      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Acting as</h3>
        <CharacterSnapshot activeCharacter={activeCharacter} playerName={playerName} isLoading={isLoading} onClick={() => setSelectorOpen(true)} />
      </section>

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
                  {online && <span className={styles.onlineDot} role="img" aria-label="Online" />}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>{player?.displayName ?? 'Unknown'}</span>
                  <span className={styles.memberRole}>
                    {roleNames[m.role]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {sortedMembers.length > members.length ? <p className={styles.overflow}>+{sortedMembers.length - members.length} others</p> : null}
      </section>

      <section className={styles.panel}>
        <h3 className={styles.panelTitle}>Quick Actions</h3>
        <p className={styles.unavailable}>Not yet available</p>
        <div className={styles.actionStubs}>
          <button type="button" disabled className={styles.actionStub} aria-label="Roll Dice — Not yet available"><TbDice size={18} aria-hidden />Roll Dice</button>
          {isSW && <button type="button" disabled className={styles.actionStub} aria-label="Start Encounter — Not yet available"><TbSwords size={18} aria-hidden />Start Encounter</button>}
          <button type="button" disabled className={styles.actionStub} aria-label="Quick Note — Not yet available"><TbNotebook size={18} aria-hidden />Quick Note</button>
        </div>
      </section>
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
