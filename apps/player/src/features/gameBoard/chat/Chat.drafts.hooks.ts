import { useCallback, useRef, useState } from 'react';
import type { ChatComposition, ChatMessageDto, ChatSendInput } from '@tapestry/types';
import { sendChatMessage } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { chatError } from './Chat.helpers';
import type { ChatDraft } from './Chat.types';
import { compositionContent, emptyComposition } from './ChatComposition.helpers';

export const emptyChatDraft: ChatDraft = { content: '', replyTo: null, status: 'idle' };

export function useChatDrafts(campaignId: string, playerId: string) {
  const [drafts, setDrafts] = useState<Record<string, ChatDraft>>({});
  const inFlightRef = useRef(new Map<string, string>());
  const updateContent = (channelId: string, content: string) => setDrafts((previous) => {
    const draft = previous[channelId] ?? emptyChatDraft;
    if (draft.status === 'sending' || draft.status === 'failed') return previous;
    return { ...previous, [channelId]: { ...draft, content, status: 'idle' } };
  });
  const updateComposition = (channelId: string, composition: ChatComposition) => setDrafts((previous) => {
    const draft = previous[channelId] ?? emptyChatDraft;
    if (draft.status === 'sending' || draft.status === 'failed') return previous;
    return { ...previous, [channelId]: { ...draft, composition, status: 'idle' } };
  });
  const setReply = (channelId: string, replyTo: ChatMessageDto | null) => setDrafts((previous) => {
    const draft = previous[channelId] ?? emptyChatDraft;
    if (draft.status === 'sending' || draft.status === 'failed') return previous;
    return { ...previous, [channelId]: { ...draft, replyTo, status: 'idle' } };
  });
  const purgeInaccessible = useCallback((allowedIds: string[]) => setDrafts((previous) => {
    const allowed = new Set(allowedIds);
    if (Object.keys(previous).every((id) => allowed.has(id))) return previous;
    return Object.fromEntries(Object.entries(previous).filter(([id]) => allowed.has(id)));
  }), []);
  const discardAttempt = (channelId: string) => setDrafts((previous) => {
    const draft = previous[channelId];
    if (!draft || draft.status !== 'failed') return previous;
    return { ...previous, [channelId]: { ...draft, attempt: undefined, error: undefined, status: 'idle' } };
  });
  const acknowledge = useCallback((channelId: string, messages: ChatMessageDto[]) => setDrafts((previous) => {
    const attempt = previous[channelId]?.attempt;
    if (!attempt || !messages.some((message) => message.clientMessageId === attempt.input.clientMessageId && message.author.playerId === playerId)) return previous;
    const draft = previous[channelId];
    return { ...previous, [channelId]: { ...emptyChatDraft, ...(attempt.input.composition ? { content: draft.content } : { composition: draft.composition }) } };
  }), [playerId]);
  const send = async (channelId: string, speaker: ChatSendInput['speaker'], labels: { speakerLabel: string; channelName: string }) => {
    const draft = drafts[channelId] ?? emptyChatDraft;
    const composition = speaker?.type === 'character' ? draft.composition ?? emptyComposition : undefined;
    const content = composition ? compositionContent(composition) : draft.content;
    if (inFlightRef.current.has(channelId) || draft.status === 'sending' || (!draft.attempt && (!content.trim() || content.length > 8000))) return;
    const attempt = draft.attempt ?? {
      channelId,
      ...labels,
      input: { clientMessageId: crypto.randomUUID(), content, ...(composition ? { composition } : {}), ...(draft.replyTo ? { replyToMessageId: draft.replyTo.id } : {}), ...(speaker ? { speaker } : {}) },
    };
    inFlightRef.current.set(channelId, attempt.input.clientMessageId);
    setDrafts((previous) => ({ ...previous, [channelId]: { ...draft, attempt, status: 'sending', error: undefined } }));
    try {
      const response = await sendChatMessage(api, campaignId, attempt.channelId, attempt.input);
      acknowledge(attempt.channelId, [response.payload]);
      return response.payload;
    } catch (error) {
      setDrafts((previous) => {
        if (previous[channelId]?.attempt?.input.clientMessageId !== attempt.input.clientMessageId) return previous;
        return { ...previous, [channelId]: { ...previous[channelId], status: 'failed', error: chatError(error, 'Your message was not confirmed. Retry to send the same message safely.') } };
      });
      return undefined;
    } finally {
      if (inFlightRef.current.get(channelId) === attempt.input.clientMessageId) inFlightRef.current.delete(channelId);
    }
  };
  return { drafts, updateContent, updateComposition, setReply, discardAttempt, purgeInaccessible, acknowledge, send };
}
