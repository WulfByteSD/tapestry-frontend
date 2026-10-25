import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { getChatChannels, getChatMessages, markChatRead } from '@tapestry/api-client';
import type { ApiResponse } from '@tapestry/api-client';
import type { ChatChannelDto, ChatHistoryResponse } from '@tapestry/types';
import { useSocket } from '@tapestry/socket';
import { api } from '@/lib/api';
import { chatKeys, chatMessages, isAccessError } from './Chat.helpers';
import { useChatDrafts } from './Chat.drafts.hooks';

export function useChatBoard(campaignId: string, currentUserId: string | undefined) {
  const playerId = currentUserId ?? '';
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const draftState = useChatDrafts(campaignId, playerId);
  const { purgeInaccessible, acknowledge } = draftState;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'conversation' | 'rolls'>('conversation');
  const selectChannel = (id: string) => { setSelectedId(id || null); setView('conversation'); };
  const selectRolls = () => setView('rolls');
  const [accessRefreshing, setAccessRefreshing] = useState(false);
  const readThroughRef = useRef(new Map<string, string>());
  const channelKey = useMemo(() => chatKeys.channels(campaignId, playerId), [campaignId, playerId]);
  const channelsQuery = useQuery({ queryKey: channelKey, queryFn: () => getChatChannels(api, campaignId), enabled: Boolean(playerId), staleTime: 15000, retry: (count, error) => !isAccessError(error) && count < 2 });
  const channels = channelsQuery.data?.payload ?? [];
  const channel = channels.find((entry) => entry.id === selectedId) ?? channels.find((entry) => !entry.archived) ?? channels[0] ?? null;
  const historyQuery = useInfiniteQuery({
    queryKey: chatKeys.messages(campaignId, playerId, channel?.id ?? ''),
    queryFn: ({ pageParam }) => getChatMessages(api, campaignId, channel!.id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.metadata.hasMore ? lastPage.metadata.nextCursor ?? undefined : undefined,
    enabled: Boolean(playerId && channel && !accessRefreshing && view === 'conversation'),
    staleTime: 15000,
    retry: (count, error) => !isAccessError(error) && count < 2,
  });
  const messages = useMemo(() => chatMessages(historyQuery.data?.pages), [historyQuery.data]);
  const refreshChannels = useCallback(() => queryClient.invalidateQueries({ queryKey: chatKeys.channels(campaignId, playerId) }), [campaignId, playerId, queryClient]);
  const refreshMessages = useCallback((channelId: string) => queryClient.invalidateQueries({ queryKey: chatKeys.messages(campaignId, playerId, channelId) }), [campaignId, playerId, queryClient]);

  // This subscription stays with the board even when another zone is visible.
  useEffect(() => queryClient.getQueryCache().subscribe((event) => {
    const key = event.query.queryKey;
    if (event.type !== 'updated' || key[0] !== 'chat' || key[1] !== campaignId || key[2] !== playerId) return;
    if (key[3] === 'channels' && event.action.type === 'success') {
      const data = event.query.state.data as ApiResponse<ChatChannelDto[]> | undefined;
      const allowed = data?.payload.map((entry) => entry.id) ?? [];
      for (const entry of data?.payload ?? []) {
        const localMarker = readThroughRef.current.get(entry.id);
        if (entry.lastReadMessageId && (!localMarker || entry.lastReadMessageId > localMarker)) readThroughRef.current.set(entry.id, entry.lastReadMessageId);
      }
      purgeInaccessible(allowed);
      for (const query of queryClient.getQueryCache().findAll({ queryKey: [...chatKeys.base(campaignId, playerId), 'messages'] })) {
        if (!allowed.includes(String(query.queryKey[4]))) {
          queryClient.cancelQueries({ queryKey: query.queryKey });
          queryClient.removeQueries({ queryKey: query.queryKey });
          readThroughRef.current.delete(String(query.queryKey[4]));
        }
      }
      setAccessRefreshing(false);
    } else if (key[3] === 'channels' && event.action.type === 'error' && isAccessError(event.action.error)) {
      purgeInaccessible([]);
      queryClient.removeQueries({ queryKey: [...chatKeys.base(campaignId, playerId), 'messages'] });
      setAccessRefreshing(true);
    } else if (key[3] === 'messages' && event.action.type === 'success') {
      const data = event.query.state.data as InfiniteData<ChatHistoryResponse> | undefined;
      acknowledge(String(key[4]), chatMessages(data?.pages));
    } else if (key[3] === 'messages' && event.action.type === 'error' && isAccessError(event.action.error)) {
      setAccessRefreshing(true);
      void refreshChannels();
    }
  }), [queryClient, campaignId, playerId, purgeInaccessible, acknowledge, refreshChannels]);

  useEffect(() => {
    if (!socket || !playerId) return;
    const refreshAll = () => {
      void refreshChannels();
      void queryClient.invalidateQueries({ queryKey: [...chatKeys.base(campaignId, playerId), 'messages'] });
    };
    const messageChanged = (event: { campaignId: string; channelId: string }) => {
      if (event.campaignId !== campaignId) return;
      void refreshMessages(event.channelId);
      void refreshChannels();
    };
    const channelChanged = (event: { campaignId: string }) => { if (event.campaignId === campaignId) void refreshChannels(); };
    const accessChanged = (event: { campaignId: string }) => {
      if (event.campaignId !== campaignId) return;
      setAccessRefreshing(true);
      void queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      refreshAll();
    };
    socket.on('connect', refreshAll);
    socket.on('chat:message:created', messageChanged);
    socket.on('chat:message:updated', messageChanged);
    socket.on('chat:message:deleted', messageChanged);
    socket.on('chat:channel:updated', channelChanged);
    socket.on('chat:unread:updated', channelChanged);
    socket.on('chat:access:changed', accessChanged);
    return () => {
      socket.off('connect', refreshAll);
      socket.off('chat:message:created', messageChanged);
      socket.off('chat:message:updated', messageChanged);
      socket.off('chat:message:deleted', messageChanged);
      socket.off('chat:channel:updated', channelChanged);
      socket.off('chat:unread:updated', channelChanged);
      socket.off('chat:access:changed', accessChanged);
    };
  }, [socket, playerId, campaignId, queryClient, refreshChannels, refreshMessages]);

  const markRead = useCallback(async (channelId: string, messageId: string) => {
    const previous = readThroughRef.current.get(channelId);
    if (previous && previous >= messageId) return;
    readThroughRef.current.set(channelId, messageId);
    try {
      await markChatRead(api, campaignId, channelId, messageId);
      await refreshChannels();
    } catch {
      if (readThroughRef.current.get(channelId) === messageId) readThroughRef.current.delete(channelId);
    }
  }, [campaignId, refreshChannels]);
  const send = async (channelId: string, speaker: Parameters<typeof draftState.send>[1], labels: Parameters<typeof draftState.send>[2]) => {
    const sent = await draftState.send(channelId, speaker, labels);
    if (sent) { await Promise.all([refreshMessages(channelId), refreshChannels()]); }
  };
  return { channels, channel, channelsQuery, historyQuery, messages, selectedId, selectChannel, selectRolls, view, accessRefreshing, isConnected, draftState, send, markRead, refreshChannels, refreshMessages };
}
