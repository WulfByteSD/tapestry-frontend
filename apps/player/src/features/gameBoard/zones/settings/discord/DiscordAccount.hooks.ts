'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDiscordAccount, setDiscordRequirement, startDiscordAccountAuthorization, unlinkDiscordAccount } from '@tapestry/api-client';
import type { DiscordRequirement } from '@tapestry/types';
import { api } from '@/lib/api';
import { useMe } from '@/lib/auth-hooks';
import { DISCORD_PENDING_KEY, discordError } from './DiscordIntegration.helpers';

export function useDiscordAccount(campaignId: string) {
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const key = ['campaign-discord-account', campaignId, user?._id];
  const status = useQuery({ queryKey: key, queryFn: () => getDiscordAccount(api, campaignId), enabled: Boolean(user?._id), retry: false, refetchInterval: 30000, refetchIntervalInBackground: false });
  const authorize = useMutation({
    mutationFn: async () => {
      const { payload } = await startDiscordAccountAuthorization(api, campaignId);
      const url = new URL(payload.url);
      const state = url.searchParams.get('state');
      if (payload.purpose !== 'account' || url.origin !== 'https://discord.com' || url.pathname !== '/oauth2/authorize' || !state || !/^[\w-]{43}$/.test(state)) throw new Error('Invalid Discord authorization URL');
      // Keep the purpose and matching state in this tab; the server independently
      // binds the single-use claim to the authenticated player and campaign.
      sessionStorage.setItem(DISCORD_PENDING_KEY, JSON.stringify({ campaignId, state, purpose: 'account' }));
      window.location.assign(payload.url);
    },
  });
  const unlink = useMutation({
    mutationFn: () => unlinkDiscordAccount(api, campaignId),
    onSuccess: (response) => {
      queryClient.setQueryData(key, response);
      void queryClient.invalidateQueries({ queryKey: ['campaign-discord-account'] });
    },
  });
  const requirement = useMutation({
    mutationFn: (value: DiscordRequirement) => setDiscordRequirement(api, campaignId, value),
    onSuccess: (response) => {
      queryClient.setQueryData(key, response);
      void queryClient.invalidateQueries({ queryKey: ['campaign-discord-account', campaignId] });
    },
  });
  const error = authorize.error ?? unlink.error ?? requirement.error;
  return { status, account: status.data?.payload, authorize, unlink, requirement, error: error ? discordError(error) : null };
}
