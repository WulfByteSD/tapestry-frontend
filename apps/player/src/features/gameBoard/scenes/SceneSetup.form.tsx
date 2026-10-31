import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createEncounterScene, getChatChannels, updateEncounterScene } from '@tapestry/api-client';
import { Button, Loader, SelectField, TextField } from '@tapestry/ui';
import type { CreateEncounterSceneInput, EncounterResolutionMode } from '@tapestry/types';
import { api } from '@/lib/api';
import { participantNames } from '../zones/encounters/TurnOrder.helpers';
import { useSceneSetupGuard } from './Scene.hooks';
import type { SceneSetupProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneSetup({ state, draft, campaign, scene, onDone }: SceneSetupProps) {
  const [title, setTitle] = useState(scene?.title ?? '');
  const [mode, setMode] = useState<EncounterResolutionMode>(scene?.mode ?? 'defense_tn');
  const [visibility, setVisibility] = useState<'campaign' | 'private'>(scene?.visibility ?? 'private');
  const [channelId, setChannelId] = useState(campaign.playSurface === 'discord' ? 'standalone' : 'new');
  const [cast, setCast] = useState(scene?.participants.map(entry => entry.id) ?? []);
  const [audience, setAudience] = useState(scene?.audiencePlayerIds ?? []);
  const names = participantNames(draft.participants);
  useSceneSetupGuard((!scene && (visibility !== 'private' || channelId !== (campaign.playSurface === 'discord' ? 'standalone' : 'new'))) || title !== (scene?.title ?? '') || mode !== (scene?.mode ?? 'defense_tn') || JSON.stringify(cast) !== JSON.stringify(scene?.participants.map(entry => entry.id) ?? []) || JSON.stringify(audience) !== JSON.stringify(scene?.audiencePlayerIds ?? []));
  const [reviewing, setReviewing] = useState(false);
  const channels = useQuery({ queryKey: ['scene-channel-options', campaign._id], queryFn: () => getChatChannels(api, campaign._id), enabled: !scene && campaign.playSurface !== 'discord', retry: false });
  const existingChannel = channels.data?.payload.find(entry => entry.id === channelId);
  const retainedReaders = existingChannel?.participantPlayerIds ?? [];
  const toggle = (ids: string[], id: string) => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
  const save = async () => {
    const channel: CreateEncounterSceneInput['channel'] = channelId === 'standalone' ? { kind: 'standalone' } : channelId === 'new' ? { kind: 'new' } : { kind: 'existing', channelId };
    await state.mutateScene(confirmed => scene
      ? updateEncounterScene(api, campaign._id, draft.id, scene.id, { revision: scene.revision, title: title.trim(), mode, participantIds: cast, audiencePlayerIds: audience, confirmOverlap: confirmed })
      : createEncounterScene(api, campaign._id, draft.id, { title: title.trim(), visibility, mode, channel, participantIds: cast, audiencePlayerIds: audience, confirmOverlap: confirmed }), scene ? 'Scene updated.' : 'Scene prepared. Open it when the cast is ready.', onDone);
  };
  return <form className={styles.form} onSubmit={event => { event.preventDefault(); if (reviewing) void save(); else setReviewing(true); }}>
    <header className={styles.heading}><h3>{scene ? 'Manage scene' : 'Prepare a scene'}</h3><Button type="button" variant="ghost" size="sm" disabled={state.busy} onClick={onDone}>Cancel</Button></header>
    <fieldset disabled={state.busy || reviewing}>
      <TextField label="Scene title" value={title} maxLength={80} required onChange={event => setTitle(event.target.value)} />
      <SelectField label="Resolution" value={mode} onChange={event => setMode(event.target.value as EncounterResolutionMode)}><option value="defense_tn">Static · Defense TN</option><option value="opposed">Opposed · Storyweaver defense</option></SelectField>
      {scene ? <p className={styles.muted}>Changing resolution affects new exchanges. Pending exchanges keep their original mode.</p> : <>
        <SelectField label="Audience" value={visibility} onChange={event => { setVisibility(event.target.value as 'campaign' | 'private'); if (channelId !== 'standalone') setChannelId('new'); }}><option value="private">Private · Invited readers and cast owners</option><option value="campaign">Public · Everyone at the table can read</option></SelectField>
        {campaign.playSurface === 'discord' ? <p className={styles.muted}>Discord table · This scene uses standalone tools in Encounters.</p> : channels.isLoading ? <Loader size="sm" label="Finding available IC channels…" /> : <SelectField label="Scene conversation" value={channelId} onChange={event => setChannelId(event.target.value)}><option value="new">Create a new IC scene chat</option>{channels.data?.payload.filter(entry => entry.mode === 'ic' && entry.visibility === visibility && !entry.archived && !entry.scene).map(entry => <option key={entry.id} value={entry.id}>Link {entry.name}</option>)}</SelectField>}
        {channels.isError && <p role="alert" className={styles.error}>Existing channels could not be loaded. <Button type="button" variant="ghost" size="sm" onClick={() => void channels.refetch()}>Retry</Button></p>}
      </>}
    </fieldset>
    <fieldset disabled={state.busy || reviewing}><legend>Cast · Characters and NPCs</legend><p className={styles.muted}>Only owners of participating characters can act or post as them. Storyweavers can narrate. NPCs begin hidden from players.</p><div className={styles.checks}>{draft.participants.map(entry => <label key={entry.id}><input type="checkbox" checked={cast.includes(entry.id)} onChange={() => setCast(toggle(cast, entry.id))} />{names.get(entry.id)} · {entry.kind === 'character' ? 'Character' : 'NPC'}</label>)}</div>{!draft.participants.length && <p className={styles.muted}>Add participants in Preparation first.</p>}</fieldset>
    <fieldset disabled={state.busy || reviewing}><legend>Invited readers · Players</legend><p className={styles.muted}>Cast owners are admitted automatically. Readers outside the cast, including observers, cannot post or act.{visibility === 'campaign' && ' This public scene is readable by all members.'}</p><div className={styles.checks}>{campaign.members.filter(entry => entry.role !== 'sw' && entry.role !== 'co-sw').map(entry => <label key={entry.player._id}><input type="checkbox" checked={audience.includes(entry.player._id)} onChange={() => setAudience(toggle(audience, entry.player._id))} />{entry.player.displayName}{entry.role === 'observer' ? ' · Observer' : ''}</label>)}</div></fieldset>
    {reviewing && <div className={styles.review} role="status"><h4>Review access before {scene ? 'saving' : 'linking'}</h4><p><strong>{title}</strong> · {cast.length} cast member{cast.length === 1 ? '' : 's'}.</p><p>{visibility === 'private' ? `${new Set([...audience, ...retainedReaders]).size} invited or existing readers, cast owners, and Storyweavers can read.` : 'Everyone at the table can read.'} Only participating character owners and Storyweavers can post.</p>{!scene && channelId !== 'new' && channelId !== 'standalone' && <p>Linking keeps this channel’s visibility, history, and existing readers. Posting pauses during private scene preparation. Newly invited readers and cast owners gain access when you open the scene. Once open, only participating character owners and Storyweavers can post; other readers remain read-only.</p>}{!!retainedReaders.length && <p>Existing readers retained: {retainedReaders.map(id => campaign.members.find(member => member.player._id === id)?.player.displayName ?? 'Existing reader').join(', ')}.</p>}<p>{scene ? 'Existing history is retained. Removing cast does not automatically remove invited readers. Audience changes in an open scene apply immediately.' : existingChannel ? 'Scene tools stay private until opened; existing channel readers keep their history access.' : 'The scene starts as a private preparation draft. Players gain access when you open it.'}</p><Button type="button" variant="outline" size="sm" onClick={() => { state.cancelOverlap(); setReviewing(false); }}>Back to edit</Button></div>}
    <div className={styles.actions}><Button type="submit" isLoading={state.busy} disabled={!title.trim()}>{reviewing ? scene ? 'Confirm changes' : 'Create scene' : 'Review scene'}</Button></div>
  </form>;
}
