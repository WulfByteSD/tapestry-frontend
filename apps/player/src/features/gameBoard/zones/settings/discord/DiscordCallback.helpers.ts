import { completeDiscordAccountAuthorization, completeDiscordAuthorization } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { DISCORD_PENDING_KEY, discordError } from './DiscordIntegration.helpers';
import type { DiscordCallbackResult, DiscordPendingAuthorization } from './DiscordIntegration.types';

export async function finishDiscordAuthorization(authenticated: boolean): Promise<DiscordCallbackResult> {
  const params = new URLSearchParams(window.location.search);
  // Remove one-use credentials before any asynchronous work or failure handling.
  window.history.replaceState(window.history.state, '', '/discord/callback');
  let pending: DiscordPendingAuthorization | null = null;
  try { pending = JSON.parse(sessionStorage.getItem(DISCORD_PENDING_KEY) ?? 'null'); } catch { /* Treat a malformed local receipt as expired. */ }
  sessionStorage.removeItem(DISCORD_PENDING_KEY);
  const campaignId = pending?.campaignId;
  const account = pending?.purpose === 'account';
  const path = typeof campaignId === 'string' && /^[a-f\d]{24}$/i.test(campaignId) ? `/games/${campaignId}/board${account ? '' : '?zone=settings'}` : '/games';
  if (!authenticated) return { path, error: 'Your Tapestry session ended. Sign in, then start Discord authorization again from your campaign.' };
  if (params.has('error')) return { path, error: 'Discord authorization was cancelled. Return to your campaign to try again.' };
  const code = params.get('code');
  const state = params.get('state');
  if (!campaignId || path === '/games' || !code || !state || state !== pending?.state || (pending?.purpose !== undefined && !['account', 'connection'].includes(pending.purpose))) return { path, error: 'This authorization has expired or was opened in a different tab. Start again from your campaign.' };
  try {
    await (account ? completeDiscordAccountAuthorization : completeDiscordAuthorization)(api, campaignId, { code, state, ...(params.has('iss') ? { iss: params.get('iss')! } : {}) });
    return { path, error: null };
  } catch (failure) { return { path, error: discordError(failure) }; }
}
