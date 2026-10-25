'use client';

import { Button, SelectField } from '@tapestry/ui';
import { connectionDraft } from './DiscordIntegration.helpers';
import type { DiscordMappingsFormProps } from './DiscordIntegration.types';
import styles from './DiscordIntegration.module.scss';

export default function DiscordMappingsForm({ draft, connection, guilds, channels, chats, disabled, channelsLoading, channelsError, chatsError, onChange, onRetry }: DiscordMappingsFormProps) {
  const guildOptions = [{ value: '', label: 'Choose a server' }, ...guilds.map((guild) => ({ value: guild.id, label: guild.name }))];
  if (draft.guildId && !guilds.some((guild) => guild.id === draft.guildId)) guildOptions.push({ value: draft.guildId, label: `${connection?.guildName ?? 'Saved server'} — unavailable` });
  const destinationOptions = (selected: string) => {
    const options = [{ value: '', label: 'Not mapped', disabled: false }, ...channels.map((channel) => ({ value: channel.id, label: `#${channel.name}${channel.available ? '' : ' — unavailable'}`, disabled: !channel.available }))];
    if (selected && !channels.some((channel) => channel.id === selected)) options.push({ value: selected, label: 'Saved channel — unavailable', disabled: true });
    return options;
  };
  const guildAvailable = guilds.some((guild) => guild.id === draft.guildId);
  const mappingsDisabled = disabled || channelsLoading || !guildAvailable || Boolean(channelsError);
  return (
    <>
      <div className={styles.step}>
        <h4>1. Choose your Discord server</h4>
        <p>Servers appear when you manage them and the Tapestry bot is already a member.</p>
        <SelectField label="Discord server" value={draft.guildId} options={guildOptions} disabled={disabled} onChange={(event) => onChange({ ...connectionDraft(null), guildId: event.target.value })} />
        {guilds.length === 0 && <p className={styles.notice}>No eligible servers found. Check that you have Manage Server permission and that the Tapestry bot has been added, then authorize again.</p>}
        {draft.guildId && !guildAvailable && <p className={styles.notice}>The saved server is no longer available to this Discord account. Choose another server, reauthorize, or disconnect below.</p>}
        <p className={styles.help}>Changing the server clears the channel choices below. Nothing changes until you save.</p>
      </div>

      {draft.guildId && guildAvailable && <div className={styles.step}>
        <h4>2. Map your campaign channels</h4>
        <p>Choose an existing campaign chat and its Discord destination. Private chats and Discord threads cannot be mapped.</p>
        {channelsLoading && <p role="status">Loading Discord channels…</p>}
        {(channelsError || chatsError) && <div role="alert" className={styles.error}><p>{channelsError ?? chatsError}</p><Button variant="outline" tone="neutral" onClick={onRetry}>Retry channels</Button></div>}
        {(['ic', 'ooc'] as const).map((purpose) => {
          const sourceKey = purpose === 'ic' ? 'icChat' : 'oocChat';
          const targetKey = purpose === 'ic' ? 'icDiscord' : 'oocDiscord';
          const label = purpose === 'ic' ? 'In Character' : 'Out of Character';
          const sources = chats.filter((chat) => chat.mode === purpose && chat.visibility === 'campaign' && !chat.archived);
          const sourceOptions = [{ value: '', label: 'Not mapped', disabled: false }, ...sources.map((chat) => ({ value: chat.id, label: chat.name, disabled: false }))];
          if (draft[sourceKey] && !sources.some((chat) => chat.id === draft[sourceKey])) sourceOptions.push({ value: draft[sourceKey], label: 'Saved chat — unavailable', disabled: true });
          const target = channels.find((channel) => channel.id === draft[targetKey]);
          return <fieldset className={styles.mapping} key={purpose} disabled={mappingsDisabled || Boolean(chatsError)}>
            <legend>{label}</legend>
            <div className={styles.mappingFields}>
              <SelectField label={`${label} campaign chat`} value={draft[sourceKey]} options={sourceOptions} disabled={mappingsDisabled || Boolean(chatsError)} onChange={(event) => onChange({ ...draft, [sourceKey]: event.target.value, ...(!event.target.value ? { [targetKey]: '' } : {}) })} />
              <SelectField label={`${label} Discord channel`} value={draft[targetKey]} options={destinationOptions(draft[targetKey])} disabled={mappingsDisabled || !draft[sourceKey]} onChange={(event) => onChange({ ...draft, [targetKey]: event.target.value })} />
            </div>
            {!sources.length && !chatsError && <p className={styles.help}>No active campaign-wide {label} chat is available. Create one in Chat, then return here to map it.</p>}
            {target && !target.available && <p className={styles.error}>{target.reason}</p>}
          </fieldset>;
        })}
        <fieldset className={styles.mapping} disabled={mappingsDisabled}>
          <legend>Rolls <span className={styles.optional}>optional</span></legend>
          <SelectField label="Rolls Discord channel" value={draft.rollsDiscord} options={destinationOptions(draft.rollsDiscord)} disabled={mappingsDisabled} onChange={(event) => onChange({ ...draft, rollsDiscord: event.target.value })} />
          <p className={styles.help}>Without a mapping, rolls stay in the web app. Each purpose needs its own Discord channel.</p>
          {channels.find((channel) => channel.id === draft.rollsDiscord)?.reason && <p className={styles.error}>{channels.find((channel) => channel.id === draft.rollsDiscord)?.reason}</p>}
        </fieldset>
        {channels.some((channel) => !channel.available) && <details className={styles.permissions}><summary>Why are some Discord channels unavailable?</summary><ul>{channels.filter((channel) => !channel.available).map((channel) => <li key={channel.id}><strong>#{channel.name}:</strong> {channel.reason}</li>)}</ul></details>}
        {!channelsLoading && !channelsError && channels.length === 0 && <p className={styles.notice}>No ordinary text channels are available in this server. You can still save the server without mappings.</p>}
      </div>}
    </>
  );
}
