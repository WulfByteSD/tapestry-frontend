'use client';

import { useState, type ReactNode } from 'react';
import type { CampaignRole, CampaignType } from '@tapestry/types';
import { Avatar, Tabs } from '@tapestry/ui';
import { TbDice, TbNotebook, TbSwords } from 'react-icons/tb';
import type { ActiveCharacterState } from '../chat/Chat.types';
import { useGameBoardPresence } from '../useGameBoardPresence';
import CharacterSnapshot from '../components/CharacterSnapshot';
import CharacterSelector from '../components/CharacterSelector';
import styles from './BoardSidebar.module.scss';

type Props = {
  campaign: CampaignType;
  isSW: boolean;
  characterState: ActiveCharacterState;
  playerName: string;
  userRole: CampaignRole | undefined;
  onQuickRoll: () => void;
  encounterTools?: ReactNode;
  selectedSceneId?: string;
};

export default function BoardSidebar({ campaign, isSW, characterState, playerName, userRole, onQuickRoll, encounterTools, selectedSceneId }: Props) {
  const [tabChoice, setTabChoice] = useState({ sceneId: selectedSceneId, tab: selectedSceneId ? 'encounter' : 'table' });
  const tab = tabChoice.sceneId === selectedSceneId ? tabChoice.tab : selectedSceneId ? 'encounter' : 'table';
  const setTab = (value: string) => setTabChoice({ sceneId: selectedSceneId, tab: value });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { activeCharacterId, activeCharacter, setActiveCharacter, isLoading, characters } = characterState;
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
  const roleNames = { sw: 'Storyweaver', 'co-sw': 'Co-Storyweaver', player: 'Player', observer: 'Observer' };
  const rollDisabledReason = campaign.status === 'archived' ? 'Archived campaign — rolls are read-only'
    : userRole === 'observer' ? 'Observers cannot roll' : !userRole ? 'Campaign membership required to roll' : '';

  return (
    <div className={styles.sidebar}>
      <Tabs activeKey={tab} onChange={setTab} variant="underline" ariaLabel="Table panel" keepMounted items={[{ key: 'table', label: 'Table', children: <>
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
        {rollDisabledReason && <p className={styles.unavailable}>{rollDisabledReason}</p>}
        <div className={styles.actionStubs}>
          <button type="button" disabled={!!rollDisabledReason} className={styles.actionStub} onClick={onQuickRoll} aria-haspopup="dialog"><TbDice size={18} aria-hidden />Roll Dice</button>
          {isSW && <button type="button" disabled className={styles.actionStub} aria-label="Start Encounter — Upcoming"><TbSwords size={18} aria-hidden />Start Encounter <span className={styles.upcoming}>Upcoming</span></button>}
          <button type="button" disabled className={styles.actionStub} aria-label="Quick Note — Upcoming"><TbNotebook size={18} aria-hidden />Quick Note <span className={styles.upcoming}>Upcoming</span></button>
        </div>
      </section>
      </> }, { key: 'encounter', label: 'Encounter', children: encounterTools }]} />
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
