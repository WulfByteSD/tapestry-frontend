'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disconnectDiscordConnection, getChatChannels, getDiscordChannels, getDiscordConnection, getDiscordGuilds, saveDiscordConnection, startDiscordAuthorization } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { connectionDraft, DISCORD_PENDING_KEY, discordError, draftError, draftInput } from './DiscordIntegration.helpers';
import type { DiscordDraft, DiscordIntegrationProps } from './DiscordIntegration.types';

export function useDiscordIntegration({ campaignId, isArchived }: DiscordIntegrationProps) {
  const queryClient = useQueryClient();
  const key = ['campaign-discord', campaignId];
  const [editedDraft, setDraft] = useState<DiscordDraft | null>(null);
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const status = useQuery({ queryKey: key, queryFn: () => getDiscordConnection(api, campaignId), retry: false, refetchInterval: 15000, refetchIntervalInBackground: false });
  const config = status.data?.payload;
  const verified = Boolean(config?.verifiedUntil && Date.parse(config.verifiedUntil) > now);
  const editable = verified && Boolean(config?.ready) && !isArchived;
  const draft = editedDraft ?? connectionDraft(config?.connection);
  const guilds = useQuery({ queryKey: [...key, 'guilds', config?.verifiedUntil], queryFn: () => getDiscordGuilds(api, campaignId), enabled: editable, retry: false });
  const guildAllowed = Boolean(guilds.data?.payload.some((guild) => guild.id === draft.guildId));
  const channels = useQuery({ queryKey: [...key, 'channels', draft.guildId, config?.verifiedUntil], queryFn: () => getDiscordChannels(api, campaignId, draft.guildId), enabled: editable && guildAllowed, retry: false });
  const chats = useQuery({ queryKey: [...key, 'chat-channels'], queryFn: () => getChatChannels(api, campaignId), enabled: editable, retry: false });

  useEffect(() => {
    if (!config?.verifiedUntil) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(0, Date.parse(config.verifiedUntil) - Date.now()) + 100);
    return () => window.clearTimeout(timer);
  }, [config?.verifiedUntil]);

  const authorize = useMutation({
    mutationFn: () => startDiscordAuthorization(api, campaignId),
    onSuccess: ({ payload }) => {
      const url = new URL(payload.url);
      if (url.origin !== 'https://discord.com' || url.pathname !== '/oauth2/authorize') { setLocalError('The authorization link was invalid. Try again.'); return; }
      sessionStorage.setItem(DISCORD_PENDING_KEY, JSON.stringify({ campaignId, state: url.searchParams.get('state'), purpose: 'connection' }));
      window.location.assign(payload.url);
    },
  });
  const save = useMutation({
    mutationFn: () => saveDiscordConnection(api, campaignId, draftInput(draft)),
    onSuccess: (response) => { queryClient.setQueryData(key, response); void queryClient.invalidateQueries({ queryKey: ['campaign-play-surface', campaignId] }); setDraft(null); setMessage(response.payload.rollsSyncActive ? 'Connection saved. New campaign rolls will be sent to the Rolls channel.' : 'Connection saved. Check the roll delivery status below.'); setLocalError(null); },
  });
  const disconnect = useMutation({
    mutationFn: () => disconnectDiscordConnection(api, campaignId),
    onSuccess: (response) => { queryClient.setQueryData(key, response); void queryClient.invalidateQueries({ queryKey: ['campaign-play-surface', campaignId] }); setDraft(null); setMessage('Discord disconnected. Your play surface and saved conversations are unchanged.'); setLocalError(null); },
  });
  const changeDraft = (next: DiscordDraft) => { setDraft(next); setMessage(''); setLocalError(null); save.reset(); };
  const submit = () => {
    const validation = draftError(draft);
    setLocalError(validation);
    if (!validation) save.mutate();
  };
  const retryChoices = () => { void guilds.refetch(); if (guildAllowed) void channels.refetch(); void chats.refetch(); };
  const error = localError ?? (authorize.error ? discordError(authorize.error) : save.error ? discordError(save.error) : disconnect.error ? discordError(disconnect.error) : null);
  return { status, config, verified, editable, draft, guilds, guildAllowed, channels, chats, authorize, save, disconnect, changeDraft, submit, retryChoices, error, message };
}
