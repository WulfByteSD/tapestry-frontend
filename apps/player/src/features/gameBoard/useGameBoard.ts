'use client';

import { useState, useMemo } from 'react';
import { useCampaign } from '@/lib/campaign-hooks';
import { useMe } from '@/lib/auth-hooks';
import type { CampaignType, CampaignRole } from '@tapestry/types';
import { api } from '@/lib/api';
import { useProfile } from '@tapestry/hooks/src/useProfile';

export type BoardZone = 'feed' | 'encounters' | 'notes' | 'rolls' | 'party' | 'character' | 'settings' | 'overview' | 'roster' | 'requests' | 'invites';

export interface UseGameBoardReturn {
  activeZone: BoardZone;
  setActiveZone: (zone: BoardZone) => void;
  campaign: CampaignType | undefined;
  userRole: CampaignRole | undefined;
  isSW: boolean;
  currentUserId: string | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useGameBoard(campaignId: string): UseGameBoardReturn {
  const [activeZone, setActiveZone] = useState<BoardZone>('feed');

  const { data: campaignResponse, isLoading: campaignLoading, isError } = useCampaign(campaignId);
  const { data: currentUser } = useMe();
  const { data: playerProfile } = useProfile(api, currentUser, 'player');

  const campaign = campaignResponse?.payload as CampaignType | undefined;

  const userRole = useMemo<CampaignRole | undefined>(() => {
    if (!campaign || !playerProfile?.payload._id) return undefined;
    const member = campaign.members.find((m) => {
      const playerId = typeof m.player === 'object' ? m.player._id : m.player;
      return playerId === playerProfile?.payload._id;
    });
    return member?.role;
  }, [campaign, playerProfile]);

  const isSW = userRole === 'sw' || userRole === 'co-sw';

  return {
    activeZone,
    setActiveZone,
    campaign,
    userRole,
    isSW,
    currentUserId: playerProfile?.payload._id,
    isLoading: campaignLoading,
    isError,
  };
}
