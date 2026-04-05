'use client';

import Link from 'next/link';
import { Button } from '@tapestry/ui';
import { useGameBoard } from '@/features/gameBoard/useGameBoard';
import type { BoardZone } from '@/features/gameBoard/useGameBoard';
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
import styles from './GameBoard.module.scss';

type Props = {
  campaignId: string;
};

function MainZone({ zone, isSW, campaign, currentUserId }: { zone: BoardZone; isSW: boolean; campaign: import('@tapestry/types').CampaignType; currentUserId: string }) {
  switch (zone) {
    case 'feed':
      return <ActivityFeedZone isSW={isSW} />;
    case 'encounters':
      return <EncounterZone isSW={isSW} />;
    case 'notes':
      return <NotesZone />;
    case 'rolls':
      return <RollsZone />;
    case 'party':
      return <PartyZone campaign={campaign} />;
    case 'character':
      return <CharacterZone campaign={campaign} isSW={isSW} currentUserId={currentUserId} />;
  }
}

export default function GameBoardView({ campaignId }: Props) {
  const { activeZone, setActiveZone, campaign, isSW, currentUserId, isLoading, isError } = useGameBoard(campaignId);

  if (isLoading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p>Loading campaign...</p>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className={styles.centered}>
        <h1>Campaign Not Found</h1>
        <p>The campaign you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/games">
          <Button variant="outline" tone="gold">
            Browse Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BoardLayout
        header={<BoardHeader campaign={campaign} campaignId={campaignId} isSW={isSW} />}
        nav={<BoardNav activeZone={activeZone} onZoneChange={setActiveZone} isSW={isSW} />}
        main={<MainZone zone={activeZone} isSW={isSW} campaign={campaign} currentUserId={currentUserId ?? ''} />}
        sidebar={<BoardSidebar campaign={campaign} isSW={isSW} />}
      />
    </div>
  );
}
