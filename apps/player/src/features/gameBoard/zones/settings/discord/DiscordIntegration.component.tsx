'use client';

import { Button } from '@tapestry/ui';
import { useDiscordIntegration } from './DiscordIntegration.hooks';
import { discordError } from './DiscordIntegration.helpers';
import DiscordMappingsForm from './DiscordMappings.form';
import DiscordRequirementSetting from './DiscordRequirement.component';
import type { DiscordIntegrationProps } from './DiscordIntegration.types';
import styles from './DiscordIntegration.module.scss';

export default function DiscordIntegration(props: DiscordIntegrationProps) {
  const state = useDiscordIntegration(props);
  const { config, status, verified, editable, draft, guilds, channels, chats, authorize, save, disconnect } = state;
  const busy = authorize.isPending || save.isPending || disconnect.isPending;
  const connection = config?.connection;
  const delivery = config?.lastRollDelivery;
  const deliveryLabels = { pending: 'Queued', retry: 'Waiting to retry', sending: 'Sending', sent: 'Sent', failed: 'Failed', uncertain: 'Unconfirmed — check Discord', cancelled: 'Cancelled' };
  const availableChannels = channels.data?.payload ?? [];
  const availableChats = chats.data?.payload ?? [];
  return <section className={styles.integration} aria-labelledby="discord-heading" aria-busy={busy}>
    <header className={styles.header}>
      <div><h3 id="discord-heading">Discord connection</h3><p>Give your campaign channels a place in your Discord server.</p></div>
      {connection && <span className={styles.savedLabel}>Connection saved</span>}
    </header>
    <DiscordRequirementSetting {...props} />
    <p className={styles.notice}>IC and OOC messages are not synced between Tapestry and Discord. Your play surface controls where the table gathers. Only new campaign rolls are delivered to a mapped Discord Rolls channel.</p>
    {status.isPending ? <p role="status">Loading Discord connection…</p> : status.isError ? <div role="alert" className={styles.error}><p>{discordError(status.error)}</p><Button tone="neutral" variant="outline" onClick={() => void status.refetch()}>Retry connection</Button></div> : <>
      <p className={styles.notice}>{props.isArchived ? 'Roll delivery is paused for this archived campaign.' : !connection?.mappings.rolls ? 'Rolls are web only. Save a Rolls channel mapping to deliver future rolls to Discord.' : !config?.rollsReady ? 'Roll delivery is unavailable. Ask the server administrator to check the bot connection.' : config.rollsSyncActive ? 'Roll delivery is enabled for new saved rolls. It continues without renewing Discord account verification.' : 'Roll delivery is not active.'}</p>
      {delivery && <div className={styles.help} role="status"><p>Latest roll delivery: {deliveryLabels[delivery.state]} · <time dateTime={delivery.at}>{new Date(delivery.at).toLocaleString()}</time></p>{delivery.error && <p>{delivery.error}</p>}</div>}
      {connection && <div className={styles.saved}>
        <h4>{guilds.data?.payload.find((guild) => guild.id === connection.guildId)?.name ?? connection.guildName}</h4>
        <p className={styles.help}>Saved destinations{!verified ? ' · names shown as last saved' : ''}</p>
        <dl className={styles.summary}>
          {(['ic', 'ooc'] as const).map((purpose) => {
            const mapping = connection.mappings[purpose];
            const discordName = availableChannels.find((channel) => channel.id === mapping?.discordChannelId)?.name ?? mapping?.discordChannelName;
            const chatName = availableChats.find((chat) => chat.id === mapping?.chatChannelId)?.name ?? mapping?.chatChannelName;
            return <div key={purpose}><dt>{purpose === 'ic' ? 'In Character' : 'Out of Character'}</dt><dd>{mapping ? `${chatName} → #${discordName}` : 'Not mapped'}</dd></div>;
          })}
          <div><dt>Rolls</dt><dd>{connection.mappings.rolls ? `#${availableChannels.find((channel) => channel.id === connection.mappings.rolls?.discordChannelId)?.name ?? connection.mappings.rolls.discordChannelName}` : 'Web only'}</dd></div>
        </dl>
      </div>}
      {props.isArchived ? <p className={styles.help}>This campaign is archived. Its Discord connection is read-only.</p> : <>
        {!config?.ready && <p className={styles.notice}>Discord authorization is not configured on this Tapestry server yet. Saved connections remain visible.</p>}
        <div className={styles.authorization}>
          <div><h4>{verified ? 'Server management authorized' : connection ? 'Authorize to edit' : 'Authorize server management'}</h4><p>{verified ? 'Server management authorization lasts 30 minutes. Permissions are checked again when you save. Your player account link is managed separately above the board.' : 'Authorize an account with Manage Server permission. Tapestry uses it to verify which servers you can connect. This does not link your player account.'}</p></div>
          <Button onClick={() => authorize.mutate()} disabled={busy || !config?.ready} isLoading={authorize.isPending} variant={verified ? 'outline' : 'solid'}>{verified ? 'Reauthorize Discord' : 'Authorize Discord'}</Button>
        </div>
        {editable && <>
          {guilds.isPending ? <p role="status">Checking your Discord servers…</p> : guilds.isError ? <div role="alert" className={styles.error}><p>{discordError(guilds.error)}</p><Button variant="outline" tone="neutral" onClick={() => void guilds.refetch()}>Retry servers</Button></div> : <DiscordMappingsForm draft={draft} connection={connection ?? null} guilds={guilds.data?.payload ?? []} channels={availableChannels} chats={availableChats} disabled={busy} channelsLoading={channels.isFetching || chats.isFetching} channelsError={channels.isError ? discordError(channels.error) : null} chatsError={chats.isError ? discordError(chats.error) : null} onChange={state.changeDraft} onRetry={state.retryChoices} />}
        </>}
        {state.error && <p role="alert" className={styles.error}>{state.error}</p>}
        {state.message && <p role="status" className={styles.success}>{state.message}</p>}
        {(editable || connection) && <footer className={styles.actions}>
          {editable && <Button onClick={state.submit} disabled={busy || !state.guildAllowed || channels.isFetching || chats.isFetching || channels.isError || chats.isError} isLoading={save.isPending}>Save connection</Button>}
          {connection && <Button tone="danger" variant="ghost" disabled={busy} isLoading={disconnect.isPending} onClick={() => disconnect.mutate()}>Disconnect Discord</Button>}
        </footer>}
      </>}
    </>}
  </section>;
}
