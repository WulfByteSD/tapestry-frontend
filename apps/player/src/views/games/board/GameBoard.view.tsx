'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Loader } from '@tapestry/ui';
import { useGameBoard } from '@/features/gameBoard/useGameBoard';
import { useActiveCharacter } from '@/features/gameBoard/useActiveCharacter';
import Chat from '@/features/gameBoard/chat/Chat.component';
import { useChatBoard } from '@/features/gameBoard/chat/Chat.hooks';
import BoardLayout from '@/features/gameBoard/layout/BoardLayout';
import BoardHeader from '@/features/gameBoard/layout/BoardHeader';
import BoardNav from '@/features/gameBoard/layout/BoardNav';
import BoardSidebar from '@/features/gameBoard/layout/BoardSidebar';
import ActivityFeedZone from '@/features/gameBoard/zones/ActivityFeedZone';
import EncounterZone from '@/features/gameBoard/zones/EncounterZone';
import NotesZone from '@/features/gameBoard/zones/NotesZone';
import RollsZone from '@/features/gameBoard/zones/RollsZone';
import PartyZone from '@/features/gameBoard/zones/PartyZone';
import CharacterZone from '@/features/gameBoard/zones/CharacterZone';
import OverviewZone from '@/features/gameBoard/zones/campaign/OverviewZone';
import RosterZone from '@/features/gameBoard/zones/campaign/RosterZone';
import RequestsZone from '@/features/gameBoard/zones/campaign/RequestsZone';
import InvitesZone from '@/features/gameBoard/zones/campaign/InvitesZone';
import SettingsZone from '@/features/gameBoard/zones/SettingsZone';
import DiscordAccountNotice from '@/features/gameBoard/zones/settings/discord/DiscordAccountNotice.component';
import { QuickRollModal } from '@/features/gameBoard/quickRoll/QuickRoll.modal';
import styles from './GameBoard.module.scss';
import type { GameBoardProps, GameBoardSessionProps, MainZoneProps } from './GameBoard.types';

function MainZone({ zone, isSW, campaign, currentUserId, chat }: MainZoneProps) {
  const isArchived = campaign.status === 'archived';

  switch (zone) {
    case 'chat':
      return chat;
    case 'feed':
      return <ActivityFeedZone campaignId={campaign._id} isSW={isSW} />;
    case 'encounters':
      return <EncounterZone isSW={isSW} />;
    case 'notes':
      return <NotesZone />;
    case 'rolls':
      return <RollsZone campaignId={campaign._id} currentUserId={currentUserId} />;
    case 'party':
      return <PartyZone campaign={campaign} />;
    case 'character':
      return <CharacterZone campaign={campaign} isSW={isSW} currentUserId={currentUserId} />;
    case 'overview':
      return <OverviewZone campaign={campaign} isSW={isSW} isArchived={isArchived} />;
    case 'roster':
      return <RosterZone campaign={campaign} isSW={isSW} currentUserId={currentUserId} isArchived={isArchived} />;
    case 'requests':
      return <RequestsZone campaign={campaign} isSW={isSW} currentUserId={currentUserId} isArchived={isArchived} />;
    case 'invites':
      return <InvitesZone campaign={campaign} isSW={isSW} isArchived={isArchived} />;
    case 'settings':
      return <SettingsZone campaign={campaign} isSW={isSW} isArchived={isArchived} />;
  }
}

export default function GameBoardView({ campaignId }: GameBoardProps) {
  const board = useGameBoard(campaignId);
  const { campaign, currentUserId, isLoading, isError } = board;

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <Loader size="lg" tone="gold" label="Loading campaign..." />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className={styles.centered}>
        <h1>Campaign Not Found</h1>
        <p>The campaign you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/games" className={styles.browseLink}>Browse Campaigns</Link>
      </div>
    );
  }

  // A new account/campaign gets a fresh draft session; zone changes keep this owner mounted.
  return <GameBoardSession key={`${campaignId}:${currentUserId ?? ''}`} {...board} campaign={campaign} campaignId={campaignId} />;
}

function GameBoardSession({ campaignId, campaign, activeZone, setActiveZone, isSW, currentUserId, userRole }: GameBoardSessionProps) {
  const characterState = useActiveCharacter(campaignId, currentUserId, isSW);
  const [quickRollOpen, setQuickRollOpen] = useState(false);
  const chat = useChatBoard(campaignId, currentUserId);
  const member = campaign.members.find((entry) => typeof entry.player === 'object' && entry.player._id === currentUserId);
  const playerName = member?.player.displayName ?? 'Player';
  const rollRole = campaign.owner === currentUserId ? 'sw' : userRole;

  return (
    <div className={styles.container}>
      <BoardLayout
        mainFlush={activeZone === 'chat'}
        header={(controls) => <><BoardHeader campaign={campaign} campaignId={campaignId} isSW={isSW} {...controls} />{currentUserId && <DiscordAccountNotice key={`${campaignId}:${currentUserId}`} campaignId={campaignId} playerId={currentUserId} />}</>}
        nav={(controls) => <BoardNav activeZone={activeZone} onZoneChange={setActiveZone} isSW={isSW} {...controls} />}
        main={<MainZone zone={activeZone} isSW={isSW} campaign={campaign} currentUserId={currentUserId ?? ''} chat={<Chat campaign={campaign} currentUserId={currentUserId ?? ''} playerName={playerName} userRole={userRole} isSW={isSW} characterState={characterState} chat={chat} />} />}
        sidebar={<BoardSidebar campaign={campaign} isSW={isSW} characterState={characterState} playerName={playerName} userRole={rollRole} onQuickRoll={() => setQuickRollOpen(true)} />}
      />
      <QuickRollModal open={quickRollOpen} onClose={() => setQuickRollOpen(false)} campaign={campaign} currentUserId={currentUserId ?? ''} playerName={playerName} userRole={rollRole} characterState={characterState} />
    </div>
  );
}
