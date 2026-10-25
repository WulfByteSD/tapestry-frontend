import type { ChatChannelDto, DiscordChannelOption, DiscordConnection, DiscordGuildOption } from '@tapestry/types';

export type DiscordIntegrationProps = { campaignId: string; isArchived: boolean };
export type DiscordPendingAuthorization = { campaignId?: string; state?: string; purpose?: 'connection' | 'account' };
export type DiscordCallbackResult = { path: string; error: string | null };
export type DiscordDraft = { guildId: string; icChat: string; icDiscord: string; oocChat: string; oocDiscord: string; rollsDiscord: string };
export type DiscordMappingsFormProps = {
  draft: DiscordDraft;
  connection: DiscordConnection | null;
  guilds: DiscordGuildOption[];
  channels: DiscordChannelOption[];
  chats: ChatChannelDto[];
  disabled: boolean;
  channelsLoading: boolean;
  channelsError: string | null;
  chatsError: string | null;
  onChange: (draft: DiscordDraft) => void;
  onRetry: () => void;
};
