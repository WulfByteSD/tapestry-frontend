'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCampaignPlaySurface, setCampaignPlaySurface } from '@tapestry/api-client';
import type { ApiResponse } from '@tapestry/api-client';
import type { CampaignPlaySurface, CampaignType } from '@tapestry/types';
import { api } from '@/lib/api';
import { useMe } from '@/lib/auth-hooks';
import type { PlaySurfaceProps } from './PlaySurface.types';

export function useCampaignPlaySurface(campaignId: string) {
  const { data: user } = useMe();
  return useQuery({
    queryKey: ['campaign-play-surface', campaignId, user?._id],
    queryFn: () => getCampaignPlaySurface(api, campaignId),
    enabled: Boolean(user?._id && campaignId),
    retry: false,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function usePlaySurfaceSetting({ campaign, isArchived }: PlaySurfaceProps) {
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const status = useCampaignPlaySurface(campaign._id);
  const [draft, setDraft] = useState<CampaignPlaySurface | null>(null);
  const current = status.data?.payload;
  const saved = current?.playSurface ?? campaign.playSurface ?? 'tapestry';
  const value = draft ?? saved;
  const save = useMutation({
    mutationFn: () => setCampaignPlaySurface(api, campaign._id, { playSurface: value }),
    onSuccess: (response) => {
      queryClient.setQueryData(['campaign-play-surface', campaign._id, user?._id], response);
      // Retain populated member profiles and change only the confirmed setting.
      queryClient.setQueryData<ApiResponse<CampaignType>>(['campaign', campaign._id], (previous) => previous ? { ...previous, payload: { ...previous.payload, playSurface: response.payload.playSurface } } : previous);
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaign._id] });
      setDraft(null);
    },
  });
  const change = (next: CampaignPlaySurface) => { setDraft(next); save.reset(); };
  const disabled = isArchived || !current?.canManage || current.readOnly || status.isError || save.isPending;
  return { status, current, saved, value, change, save, disabled };
}
