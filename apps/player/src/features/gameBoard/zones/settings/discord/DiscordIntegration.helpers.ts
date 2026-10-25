import type { DiscordConnection, DiscordConnectionInput } from '@tapestry/types';
import type { DiscordDraft } from './DiscordIntegration.types';

export const DISCORD_PENDING_KEY = 'tapestry-discord-authorization';
export function discordError(error: unknown): string {
  const response = error as { response?: { data?: { message?: string } } };
  return response?.response?.data?.message ?? 'Could not reach the connection service. Try again.';
}
export function connectionDraft(connection: DiscordConnection | null | undefined): DiscordDraft {
  return {
    guildId: connection?.guildId ?? '',
    icChat: connection?.mappings.ic?.chatChannelId ?? '',
    icDiscord: connection?.mappings.ic?.discordChannelId ?? '',
    oocChat: connection?.mappings.ooc?.chatChannelId ?? '',
    oocDiscord: connection?.mappings.ooc?.discordChannelId ?? '',
    rollsDiscord: connection?.mappings.rolls?.discordChannelId ?? '',
  };
}
export function draftInput(draft: DiscordDraft): DiscordConnectionInput {
  return { guildId: draft.guildId, mappings: {
    ic: draft.icChat && draft.icDiscord ? { chatChannelId: draft.icChat, discordChannelId: draft.icDiscord } : null,
    ooc: draft.oocChat && draft.oocDiscord ? { chatChannelId: draft.oocChat, discordChannelId: draft.oocDiscord } : null,
    rolls: draft.rollsDiscord ? { discordChannelId: draft.rollsDiscord } : null,
  } };
}
export function draftError(draft: DiscordDraft) {
  if (!draft.guildId) return 'Choose a Discord server.';
  if (Boolean(draft.icChat) !== Boolean(draft.icDiscord) || Boolean(draft.oocChat) !== Boolean(draft.oocDiscord)) return 'Choose both channels for each chat mapping, or leave both unmapped.';
  const destinations = [draft.icDiscord, draft.oocDiscord, draft.rollsDiscord].filter(Boolean);
  if (new Set(destinations).size !== destinations.length) return 'Choose a different Discord channel for each purpose.';
  return null;
}
