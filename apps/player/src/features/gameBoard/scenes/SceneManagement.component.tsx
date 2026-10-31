import { useState } from 'react';
import type { EncounterScene } from '@tapestry/types';
import { Button, Loader } from '@tapestry/ui';
import { changeEncounterSceneLifecycle, endEncounter, updateSceneTurnOrder } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { SceneOverlap } from './SceneOverlap.component';
import { SceneSetup } from './SceneSetup.form';
import { SceneTracker } from './SceneTracker.component';
import { SceneTransfer } from './SceneTransfer.form';
import { sceneTurnDraft } from './Scene.helpers';
import TurnOrder from '../zones/encounters/TurnOrder.component';
import type { SceneManagementProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneManagement({ state, draft, campaign, archived, onEnter, screen = 'scenes' }: SceneManagementProps) {
  const [editing, setEditing] = useState<'new' | 'edit' | null>(null);
  const [editingScene, setEditingScene] = useState<EncounterScene | null>(null);
  const [lifecycleReview, setLifecycleReview] = useState<'complete' | 'reopen' | 'end' | null>(null);
  const [transferring, setTransferring] = useState(false);
  const scenes = state.list.data?.payload.filter(entry => entry.encounterId === draft.id) ?? [];
  const candidate = state.scene ?? (state.retainedScene?.id === state.selected?.id ? state.retainedScene : null);
  const selected = candidate?.encounterId === draft.id ? candidate : null;
  const accessPending = state.refreshingAccess || state.detail.isLoading || state.detail.isError || state.list.isError;
  const lifecycle = async (action: 'open' | 'complete' | 'reopen') => {
    if (!selected) return;
    await state.mutateScene(confirmed => changeEncounterSceneLifecycle(api, campaign._id, draft.id, selected.id, { revision: selected.revision, action, confirmOverlap: confirmed }), action === 'complete' ? 'Scene completed.' : 'Scene opened for its audience.', () => setLifecycleReview(null));
  };
  return <section className={styles.section} aria-label="Encounter scenes">
    <header className={styles.heading}><div><h3>{screen === 'turns' ? 'Scene turn order' : screen === 'tracker' ? 'Combat tracker' : 'Scenes'}</h3><p className={styles.muted}>Each scene has its own cast, audience and turn order.</p></div>{!archived && <div className={styles.actions}><Button type="button" variant="outline" disabled={state.busy} data-encounter-discard onClick={() => setEditing('new')}>New scene</Button>{scenes.some(scene => scene.status === 'open') && <Button type="button" variant="ghost" disabled={state.busy} onClick={() => setLifecycleReview('end')}>End encounter</Button>}</div>}</header>
    <p className={styles.status} role="status">{state.busy ? 'Saving scene…' : state.notice}</p>
    <SceneOverlap state={state} />
    {lifecycleReview && <div className={styles.review} role="status"><h4>{lifecycleReview === 'end' ? 'End this encounter?' : lifecycleReview === 'reopen' ? 'Reopen this scene?' : 'Complete this scene?'}</h4><p>{lifecycleReview === 'reopen' ? 'Health, conditions, exchanges and turn order are preserved. An ended encounter becomes active again.' : lifecycleReview === 'end' ? 'All scenes in this encounter become completed. Conversations and tools become read-only.' : 'This conversation and its tools become read-only. Its state is preserved.'}</p><div className={styles.actions}><Button type="button" disabled={state.busy} isLoading={state.busy} onClick={() => { if (lifecycleReview === 'end') void state.run(() => endEncounter(api, campaign._id, draft.id), 'Encounter ended. All scenes are read-only.').then(result => { if (result) setLifecycleReview(null); }); else void lifecycle(lifecycleReview); }}>Confirm {lifecycleReview === 'end' ? 'end encounter' : lifecycleReview === 'reopen' ? 'reopen' : 'completion'}</Button><Button type="button" variant="outline" disabled={state.busy} onClick={() => setLifecycleReview(null)}>Cancel</Button></div></div>}
    {state.error && <div role="alert" className={styles.error}>{state.error}<p>Your entries are kept. Refresh the scene before retrying stale changes.</p><Button type="button" variant="outline" size="sm" disabled={state.busy} onClick={() => void state.refresh()}>Refresh scene</Button></div>}
    {state.list.isLoading ? <Loader label="Loading scenes…" /> : state.list.isError ? <div role="alert"><p>Scenes could not be loaded.</p><Button type="button" onClick={() => void state.list.refetch()}>Retry</Button></div> : <ul className={styles.list}>{scenes.map(scene => <li key={scene.id} className={styles.sceneRow}><button type="button" data-encounter-discard className={styles.sceneSelect} aria-current={state.selected?.id === scene.id ? 'true' : undefined} disabled={state.busy} onClick={() => { state.select(scene); setEditing(null); setTransferring(false); }}><strong>{scene.title}</strong><span>{scene.status} · {scene.visibility === 'private' ? 'Private audience' : 'Public audience'} · {scene.mode === 'opposed' ? 'Opposed' : 'Defense TN'}</span></button>{scene.status !== 'draft' && scene.channelId && campaign.playSurface !== 'discord' && <Button type="button" size="sm" variant="ghost" onClick={() => onEnter(scene)}>Enter scene</Button>}</li>)}</ul>}
    {state.selected?.encounterId === draft.id && accessPending && <p className={styles.status}>Updating scene access… <Button type="button" variant="ghost" onClick={() => void state.refresh()}>Retry</Button></p>}
    {!scenes.length && !editing && <p className={styles.muted}>Prepare a scene to choose which participants enter play. Your encounter draft stays private.</p>}
    {editing && !archived && (editing === 'new' || editingScene) ? <SceneSetup key={editing === 'new' ? `new-${draft.id}` : editingScene!.id} state={state} draft={draft} campaign={campaign} scene={editing === 'edit' ? selected?.id === editingScene?.id ? selected! : editingScene! : undefined} onDone={() => setEditing(null)} /> : selected && <div className={styles.divider} hidden={accessPending}>
      <header className={styles.heading}><div><p className={styles.eyebrow}>{selected.status === 'draft' ? 'Private preparation' : selected.status}</p><h3>{selected.title}</h3></div>{!archived && <div className={styles.actions}>{selected.status !== 'completed' && <><Button type="button" variant="outline" size="sm" disabled={state.busy} onClick={() => { setEditingScene(selected); setEditing('edit'); }}>Manage cast & audience</Button>{selected.status === 'open' && <Button type="button" variant="ghost" size="sm" disabled={state.busy} onClick={() => setTransferring(!transferring)}>Move cast</Button>}</>}<Button type="button" size="sm" disabled={state.busy} onClick={() => { if (selected.status === 'draft') void lifecycle('open'); else setLifecycleReview(selected.status === 'completed' ? 'reopen' : 'complete'); }}>{selected.status === 'draft' ? 'Open for players' : selected.status === 'completed' ? 'Reopen scene' : 'Complete scene'}</Button></div>}</header>
      {transferring && <SceneTransfer state={state} scene={selected} onDone={() => setTransferring(false)} />}
      {screen === 'turns' ? <TurnOrder key={selected.id} draft={sceneTurnDraft(selected)} disabled={state.busy} readOnly={archived || selected.status !== 'open'} onPrepare={() => { setEditingScene(selected); setEditing('edit'); }} onTurn={async action => Boolean(await state.run(() => updateSceneTurnOrder(api, campaign._id, draft.id, selected.id, { revision: selected.revision, ...action })))} /> : <SceneTracker state={state} scene={selected} readOnly={archived || selected.status === 'completed'} />}
    </div>}
  </section>;
}
