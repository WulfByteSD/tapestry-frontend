'use client';

import { Button, SelectField } from '@tapestry/ui';
import type { CampaignPlaySurface } from '@tapestry/types';
import { usePlaySurfaceSetting } from './PlaySurface.hooks';
import type { PlaySurfaceProps } from './PlaySurface.types';
import { discordError } from '../discord/DiscordIntegration.helpers';
import styles from './PlaySurface.module.scss';

export default function PlaySurface(props: PlaySurfaceProps) {
  const { status, current, saved, value, change, save, disabled } = usePlaySurfaceSetting(props);
  return <section className={styles.section} aria-labelledby="play-surface-heading" aria-busy={save.isPending}>
    <h3 id="play-surface-heading">Where does your table play?</h3>
    <p>Choose Tapestry for conversations on this board, or Discord to gather in your connected server. Discord replaces Chat in the board navigation.</p>
    <p className={styles.help}>Your existing Tapestry conversations are preserved. Switch back to Tapestry to continue them. Messages are not synced between the two.</p>
    {status.isPending ? <p role="status">Loading play surface…</p> : status.isError ? <div role="alert"><p>{discordError(status.error)}</p><Button variant="outline" onClick={() => void status.refetch()}>Retry play surface</Button></div> : <>
      <SelectField id="campaign-play-surface" label="Play surface" value={value} disabled={disabled} onChange={(event) => change(event.target.value as CampaignPlaySurface)}>
        <option value="tapestry">Tapestry</option>
        <option value="discord" disabled={!current?.discordUrl && saved !== 'discord'}>Discord</option>
      </SelectField>
      {!current?.discordUrl && <p className={styles.help}>{saved === 'discord' ? 'The Discord link is unavailable. Reconnect a server below, or switch back to Tapestry.' : 'Connect and save a Discord server below before choosing Discord.'}</p>}
      {(props.isArchived || current?.readOnly) && <p className={styles.help}>This campaign is archived. Its play surface is read-only.</p>}
      <div className={styles.actions}><Button onClick={() => save.mutate()} disabled={disabled || value === saved || (value === 'discord' && !current?.discordUrl)} isLoading={save.isPending}>Save play surface</Button></div>
      {save.isSuccess && <p role="status">Play surface saved. {saved === 'discord' ? 'Open Discord from the board navigation.' : 'Chat is available in the board navigation.'}</p>}
      {save.isError && <p role="alert" className={styles.error}>{discordError(save.error)}</p>}
    </>}
  </section>;
}
