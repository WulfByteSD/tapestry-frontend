import type { AxiosInstance } from 'axios';
import type { ChatComposition, ChatChannelDto, ChatCreateChannelInput, ChatHistoryResponse, ChatMessageDto, ChatReadState, ChatSendInput, ChatUpdateChannelInput } from '@tapestry/types';
import type { ApiResponse } from '../fetch';

const chatPath = (campaignId: string) => `/game/campaigns/${campaignId}/chat`;
export async function getChatChannels(api: AxiosInstance, campaignId: string) {
  const response = await api.get<ApiResponse<ChatChannelDto[]>>(`${chatPath(campaignId)}/channels`);
  return response.data;
}
export async function setupChatChannels(api: AxiosInstance, campaignId: string) {
  const response = await api.post<ApiResponse<ChatChannelDto[]>>(`${chatPath(campaignId)}/setup`);
  return response.data;
}
export async function createChatChannel(api: AxiosInstance, campaignId: string, input: ChatCreateChannelInput) {
  const response = await api.post<ApiResponse<ChatChannelDto>>(`${chatPath(campaignId)}/channels`, input);
  return response.data;
}
export async function updateChatChannel(api: AxiosInstance, campaignId: string, channelId: string, input: ChatUpdateChannelInput) {
  const response = await api.patch<ApiResponse<ChatChannelDto>>(`${chatPath(campaignId)}/channels/${channelId}`, input);
  return response.data;
}
export async function getChatMessages(api: AxiosInstance, campaignId: string, channelId: string, before?: string) {
  const response = await api.get<ChatHistoryResponse>(`${chatPath(campaignId)}/channels/${channelId}/messages`, { params: { before, limit: 50 } });
  return response.data;
}
export async function sendChatMessage(api: AxiosInstance, campaignId: string, channelId: string, input: ChatSendInput) {
  const response = await api.post<ApiResponse<ChatMessageDto>>(`${chatPath(campaignId)}/channels/${channelId}/messages`, input);
  return response.data;
}
export async function editChatMessage(api: AxiosInstance, campaignId: string, messageId: string, content: string, composition?: ChatComposition) {
  const response = await api.patch<ApiResponse<ChatMessageDto>>(`${chatPath(campaignId)}/messages/${messageId}`, { content, ...(composition ? { composition } : {}) });
  return response.data;
}
export async function removeChatMessage(api: AxiosInstance, campaignId: string, messageId: string) {
  const response = await api.delete<ApiResponse<ChatMessageDto>>(`${chatPath(campaignId)}/messages/${messageId}`);
  return response.data;
}
export async function markChatRead(api: AxiosInstance, campaignId: string, channelId: string, throughMessageId: string) {
  const response = await api.put<ApiResponse<ChatReadState>>(`${chatPath(campaignId)}/channels/${channelId}/read`, { throughMessageId });
  return response.data;
}
