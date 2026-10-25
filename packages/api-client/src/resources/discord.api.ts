import type { AxiosInstance } from 'axios';
import type { DiscordAccountStatus, DiscordRequirement, DiscordChannelOption, DiscordConnectionInput, DiscordConnectionStatus, DiscordGuildOption } from '@tapestry/types';
import type { ApiResponse } from '../fetch';

const discordPath = (campaignId: string) => `/game/campaigns/${campaignId}/discord`;
export async function getDiscordAccount(api: AxiosInstance, campaignId: string) {
  return (await api.get<ApiResponse<DiscordAccountStatus>>(`${discordPath(campaignId)}/account`)).data;
}
export async function startDiscordAccountAuthorization(api: AxiosInstance, campaignId: string) {
  return (await api.post<ApiResponse<{ url: string; purpose: 'account' }>>(`${discordPath(campaignId)}/account/authorization`)).data;
}
export async function completeDiscordAccountAuthorization(api: AxiosInstance, campaignId: string, input: { state: string; code: string; iss?: string }) {
  return (await api.post<ApiResponse<DiscordAccountStatus>>(`${discordPath(campaignId)}/account/authorization/complete`, input)).data;
}
export async function unlinkDiscordAccount(api: AxiosInstance, campaignId: string) {
  return (await api.delete<ApiResponse<DiscordAccountStatus>>(`${discordPath(campaignId)}/account`)).data;
}
export async function setDiscordRequirement(api: AxiosInstance, campaignId: string, requirement: DiscordRequirement) {
  return (await api.put<ApiResponse<DiscordAccountStatus>>(`${discordPath(campaignId)}/requirement`, { requirement })).data;
}
export async function getDiscordConnection(api: AxiosInstance, campaignId: string) {
  return (await api.get<ApiResponse<DiscordConnectionStatus>>(discordPath(campaignId))).data;
}
export async function startDiscordAuthorization(api: AxiosInstance, campaignId: string) {
  return (await api.post<ApiResponse<{ url: string }>>(`${discordPath(campaignId)}/authorization`)).data;
}
export async function completeDiscordAuthorization(api: AxiosInstance, campaignId: string, input: { state: string; code: string; iss?: string }) {
  return (await api.post<ApiResponse<{ verifiedUntil: string }>>(`${discordPath(campaignId)}/authorization/complete`, input)).data;
}
export async function getDiscordGuilds(api: AxiosInstance, campaignId: string) {
  return (await api.get<ApiResponse<DiscordGuildOption[]>>(`${discordPath(campaignId)}/guilds`)).data;
}
export async function getDiscordChannels(api: AxiosInstance, campaignId: string, guildId: string) {
  return (await api.get<ApiResponse<DiscordChannelOption[]>>(`${discordPath(campaignId)}/guilds/${guildId}/channels`)).data;
}
export async function saveDiscordConnection(api: AxiosInstance, campaignId: string, input: DiscordConnectionInput) {
  return (await api.put<ApiResponse<DiscordConnectionStatus>>(discordPath(campaignId), input)).data;
}
export async function disconnectDiscordConnection(api: AxiosInstance, campaignId: string) {
  return (await api.delete<ApiResponse<DiscordConnectionStatus>>(discordPath(campaignId))).data;
}
