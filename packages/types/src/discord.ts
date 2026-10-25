export type DiscordGuildOption = { id: string; name: string };
export type DiscordRequirement = 'optional' | 'required';
export type DiscordAccountStatus = { requirement: DiscordRequirement; linked: boolean; ready: boolean; canManage: boolean; readOnly: boolean };
export type DiscordChannelOption = { id: string; name: string; available: boolean; reason?: string };
export type DiscordChatMapping = { chatChannelId: string; discordChannelId: string; chatChannelName: string; discordChannelName: string };
export type DiscordRollsMapping = { discordChannelId: string; discordChannelName: string };
export type DiscordConnection = {
  guildId: string;
  guildName: string;
  mappings: { ic: DiscordChatMapping | null; ooc: DiscordChatMapping | null; rolls: DiscordRollsMapping | null };
};
export type DiscordConnectionStatus = {
  connection: DiscordConnection | null;
  ready: boolean;
  verifiedUntil: string | null;
  syncActive: false;
  rollsReady?: boolean;
  rollsSyncActive?: boolean;
  lastRollDelivery?: { rollId: string; state: 'pending' | 'retry' | 'sending' | 'sent' | 'failed' | 'uncertain' | 'cancelled'; at: string; error: string | null } | null;
};
export type DiscordConnectionInput = {
  guildId: string;
  mappings: {
    ic: Pick<DiscordChatMapping, 'chatChannelId' | 'discordChannelId'> | null;
    ooc: Pick<DiscordChatMapping, 'chatChannelId' | 'discordChannelId'> | null;
    rolls: Pick<DiscordRollsMapping, 'discordChannelId'> | null;
  };
};
