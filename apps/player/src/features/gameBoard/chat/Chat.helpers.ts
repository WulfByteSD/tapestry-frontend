import { isAxiosError } from 'axios';
import type { ChatHistoryResponse, ChatMessageDto, ChatReplySummary } from '@tapestry/types';
import { compositionParts } from './ChatComposition.helpers';

export const chatKeys = {
  base: (campaignId: string, playerId: string) => ['chat', campaignId, playerId] as const,
  channels: (campaignId: string, playerId: string) => [...chatKeys.base(campaignId, playerId), 'channels'] as const,
  messages: (campaignId: string, playerId: string, channelId: string) => [...chatKeys.base(campaignId, playerId), 'messages', channelId] as const,
};
export function chatError(error: unknown, fallback = 'This action could not be completed. Please try again.'): string {
  if (isAxiosError<{ error?: string; message?: string }>(error)) {
    const data = error.response?.data;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  }
  return fallback;
}
export function isAccessError(error: unknown): boolean {
  return isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404);
}
export function chatMessages(pages: ChatHistoryResponse[] | undefined): ChatMessageDto[] {
  const messages = new Map<string, ChatMessageDto>();
  for (const page of [...(pages ?? [])].reverse()) for (const message of page.payload) messages.set(message.id, message);
  return [...messages.values()].sort((a, b) => a.id.localeCompare(b.id));
}
export function speakerName(message: Pick<ChatMessageDto | ChatReplySummary, 'author' | 'speaker'>): string {
  return message.speaker.type === 'narrator' ? 'Narrator' : message.speaker.type === 'character' ? message.speaker.characterName || 'Character' : message.author.displayName;
}
export function messageTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
export function messagePreview(message: Pick<ChatMessageDto, 'content' | 'composition'>): string {
  return message.composition ? compositionParts(message.composition).map((part) => part.text.trim()).filter(Boolean).join(' — ') : message.content;
}
