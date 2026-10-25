import type { ReactNode } from 'react';
import type { CampaignType } from '@tapestry/types';
import type { BoardZone, UseGameBoardReturn } from '@/features/gameBoard/useGameBoard';
export type GameBoardProps = { campaignId: string };
export type GameBoardSessionProps = Pick<UseGameBoardReturn, 'activeZone' | 'setActiveZone' | 'isSW' | 'currentUserId' | 'userRole'> & { campaignId: string; campaign: CampaignType };
export type MainZoneProps = { zone: BoardZone; isSW: boolean; campaign: CampaignType; currentUserId: string; chat: ReactNode };
