'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCampaign } from '@/lib/campaign-hooks';
import { useMe } from '@/lib/auth-hooks';
import type { CampaignType, CampaignRole, CampaignPlaySurface } from '@tapestry/types';
import { api } from '@/lib/api';
import { useProfile } from '@tapestry/hooks/src/useProfile';
import { useCampaignPlaySurface } from './zones/settings/playSurface/PlaySurface.hooks';

export type BoardZone = 'chat' | 'feed' | 'encounters' | 'notes' | 'rolls' | 'party' | 'character' | 'settings' | 'overview' | 'roster' | 'requests' | 'invites';

export interface UseGameBoardReturn {
  activeZone: BoardZone;
  setActiveZone: (zone: BoardZone) => void;
  campaign: CampaignType | undefined;
  userRole: CampaignRole | undefined;
  isSW: boolean;
  currentUserId: string | undefined;
  isLoading: boolean;
  isError: boolean;
  playSurface: CampaignPlaySurface;
  discordUrl: string | null;
}

export function useGameBoard(campaignId: string): UseGameBoardReturn {
  const searchParams = useSearchParams();
  const [activeZone, setActiveZone] = useState<BoardZone>(() => searchParams.get('zone') === 'settings' ? 'settings' : 'chat');

  const { data: campaignResponse, isLoading: campaignLoading, isError } = useCampaign(campaignId);
  const { data: currentUser } = useMe();
  const { data: playerProfile } = useProfile(api, currentUser, 'player');
  const surface = useCampaignPlaySurface(campaignId);

  const campaign = campaignResponse?.payload as CampaignType | undefined;
  const playSurface = surface.data?.payload.playSurface ?? campaign?.playSurface ?? 'tapestry';

  const userRole = useMemo<CampaignRole | undefined>(() => {
    if (!campaign || !playerProfile?.payload._id) return undefined;
    const member = campaign.members.find((m) => {
      const playerId = typeof m.player === 'object' ? m.player._id : m.player;
      return playerId === playerProfile?.payload._id;
    });
    return member?.role;
  }, [campaign, playerProfile]);

  const isSW = surface.data?.payload.canManage ?? (userRole === 'sw' || userRole === 'co-sw' || Boolean(playerProfile?.payload._id && campaign?.owner === playerProfile.payload._id));

  return {
    activeZone: playSurface === 'discord' && activeZone === 'chat' ? 'feed' : activeZone,
    setActiveZone,
    campaign: campaign ? { ...campaign, playSurface } : campaign,
    playSurface,
    discordUrl: surface.data?.payload.discordUrl ?? null,
    userRole,
    isSW,
    currentUserId: playerProfile?.payload._id,
    isLoading: campaignLoading || surface.isLoading,
    isError,
  };
}
