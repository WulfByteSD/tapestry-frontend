import { useEffect, useState } from 'react';
import type { EncounterExchange } from '@tapestry/types';
import type { EncounterScreen } from './Scene.types';
import { Avatar, Button, Loader, SelectField } from '@tapestry/ui';
import { TbArrowRight, TbClipboardList, TbListNumbers, TbMovie, TbShield } from 'react-icons/tb';
import { updateSceneTurnOrder } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { SceneOverlap } from './SceneOverlap.component';
import { SceneTracker } from './SceneTracker.component';
import { SceneAttack } from './SceneAttack.form';
import { SceneDefense } from './SceneDefense.form';
import { SceneRollModal } from './SceneRoll.modal';
import { SceneExchange } from './SceneExchange.component';
import { currentSceneTurn } from './Scene.helpers';
import type { SceneToolsProps } from './Scene.types';
import styles from './Scene.module.scss';

const managementScreens = [
  { screen: 'preparation', label: 'Preparation', Icon: TbClipboardList },
  { screen: 'scenes', label: 'Scenes', Icon: TbMovie },
  { screen: 'turn-order', label: 'Turn order', Icon: TbListNumbers },
  { screen: 'tracker', label: 'Combat tracker', Icon: TbShield },
] satisfies { screen: EncounterScreen; label: string; Icon: typeof TbShield }[];

export function SceneTools(props: SceneToolsProps) {
  const { state, archived, characterState, viewerId } = props;
  const [action, setAction] = useState<{ sceneId: string; actorId: string; targetId?: string } | null>(null);
  const [defenseSnapshot, setDefenseSnapshot] = useState<EncounterExchange | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const scene = state.scene ?? (state.retainedScene?.id === state.selected?.id ? state.retainedScene : null);
  const accessPending = state.refreshingAccess || state.detail.isLoading || state.detail.isError || state.list.isError;
  const exchanges = state.exchanges.data?.payload.items ?? [];
  const defense = defenseSnapshot && defenseSnapshot.sceneId === scene?.id ? exchanges.find(entry => entry.id === defenseSnapshot.id) ?? defenseSnapshot : null;
  const readOnly = archived || scene?.status !== 'open';
  const characters = characterState.characters.filter(entry => entry.player === viewerId && scene?.playableCharacterIds.includes(entry._id));
  const actors = scene?.participants.filter(entry => entry.kind === 'combatant' ? scene.canManage && entry.revealed : entry.ownerPlayerId === viewerId && characters.some(character => character._id === entry.characterId)) ?? [];
  const actor = actors.find(entry => entry.id === state.actingParticipantId) ?? actors.find(entry => entry.characterId === characterState.activeCharacterId);
  const actionActor = scene?.participants.find(entry => entry.id === action?.actorId);
  const canAct = !readOnly && !!actionActor && (actionActor.kind === 'combatant' ? scene!.canManage && actionActor.revealed : actionActor.ownerPlayerId === viewerId && scene!.playableCharacterIds.includes(actionActor.characterId ?? ''));
  const defenseTarget = scene?.participants.find(entry => entry.id === defense?.targetParticipantId);
  const canDefend = !readOnly && !!defenseTarget && (scene!.canManage || (defenseTarget.kind === 'character' && defenseTarget.ownerPlayerId === viewerId));
  const chooseActor = (participantId: string) => {
    const next = actors.find(entry => entry.id === participantId);
    state.selectActor(next?.kind === 'combatant' ? next.id : null);
    if (next?.kind === 'character') characterState.setActiveCharacter(next.characterId!);
  };
  useEffect(() => {
    if (action && action.sceneId !== state.selected?.id) setAction(null);
    if (defenseSnapshot && defenseSnapshot.sceneId !== state.selected?.id) setDefenseSnapshot(null);
  }, [state.selected?.id, action, defenseSnapshot]);
  const pendingDefenses = exchanges.filter(entry => entry.status === 'pending' && (scene?.canManage || scene?.participants.some(participant => participant.id === entry.targetParticipantId && participant.kind === 'character' && participant.ownerPlayerId === viewerId)));
  const advanceTurn = async () => {
    if (!scene) return;
    setAdvancing(true);
    try { await state.run(() => updateSceneTurnOrder(api, scene.campaignId, scene.encounterId, scene.id, { revision: scene.revision, action: 'advance' })); }
    finally { setAdvancing(false); }
  };
  return <section className={styles.tools} aria-label="Encounter tools">
    <SelectField label="Encounter scene" value={state.refreshingAccess || state.list.isError ? '' : state.selected?.id ?? ''} disabled={state.refreshingAccess || state.list.isError} onChange={event => { state.select(state.list.data?.payload.find(entry => entry.id === event.target.value) ?? null); setAction(null); setDefenseSnapshot(null); }}><option value="">Choose a scene</option>{!state.refreshingAccess && !state.list.isError && state.list.data?.payload.map(entry => <option key={entry.id} value={entry.id}>{entry.encounterTitle} · {entry.title}{entry.status === 'completed' ? ' · Completed' : ''}</option>)}</SelectField>
    {((state.refreshingAccess && !state.list.isError) || state.detail.isLoading) && <Loader label="Loading scene tools…" />}
    {(state.detail.isError || state.list.isError) && <p className={styles.error}>This scene is unavailable. <Button type="button" variant="outline" onClick={() => void state.refresh()}>Retry access</Button></p>}
    {!scene && !accessPending && <p className={styles.muted}>Select a scene conversation or choose a scene here.</p>}
    {scene && <div hidden={accessPending}>
      <header className={styles.sceneSummary}>
        <p className={styles.eyebrow}>{scene.encounterTitle}</p><h3>{scene.title}</h3>
        <p className={styles.muted}>{scene.mode === 'opposed' ? 'Opposed defense' : 'Static · Defense TN'}{readOnly ? ' · Read only' : ''}</p>
      </header>
      <div className={styles.currentTurn}>
        <div className={styles.turnLabel}><span>Current turn</span><span>Round {scene.turnOrder.round}</span></div>
        <strong title={currentSceneTurn(scene)}>{currentSceneTurn(scene)}</strong>
        {scene.canManage && !readOnly && <Button type="button" fullWidth leftIcon={<TbArrowRight aria-hidden />} isLoading={advancing} disabled={state.busy || !scene.turnOrder.slots.length} onClick={() => void advanceTurn()}>Next turn</Button>}
      </div>
      {!readOnly && !!pendingDefenses.length && <section className={styles.toolSection}><h4>Awaiting your defense</h4>{pendingDefenses.map(entry => <div className={styles.pendingDefense} key={entry.id}><p><strong>{entry.targetName}</strong><span>{entry.actorName} · Attack {entry.attack.total}</span></p><Button type="button" size="sm" disabled={state.busy} onClick={() => setDefenseSnapshot(entry)}>Defend {entry.targetName}</Button></div>)}</section>}
      {!readOnly && <section className={styles.toolSection}><h4>Your action</h4>
        <SelectField label="Acting as" value={actor?.id ?? ''} disabled={state.busy} onChange={event => chooseActor(event.target.value)}><option value="" disabled>Choose a scene participant</option>{actors.map(entry => <option key={entry.id} value={entry.id}>{entry.name}{entry.kind === 'combatant' ? ' · NPC' : ''}</option>)}{scene.canManage && scene.participants.filter(entry => entry.kind === 'combatant' && !entry.revealed).map(entry => <option key={entry.id} value={entry.id} disabled>{entry.name} · Reveal before acting</option>)}</SelectField>
        {actor ? <><div className={styles.actionIdentity}><Avatar name={actor.name} src={actor.portraitUrl} size="sm" /><div><strong>{actor.name}</strong><p className={styles.muted}>{actor.kind === 'combatant' ? 'Acting and speaking as this NPC' : 'Your participating character'}</p></div></div><Button type="button" fullWidth disabled={state.busy} onClick={() => setAction({ sceneId: scene.id, actorId: actor.id })}>Make an action</Button></> : <p className={styles.muted}>{scene.canManage ? 'Choose your character or a revealed NPC to act and speak in this scene.' : 'Choose your participating character to act.'}</p>}
      </section>}
      {scene.canManage ? <>
        {props.onManageScene && <nav className={styles.managementNav} aria-label="Storyweaver encounter screens">{managementScreens.map(({ screen, label, Icon }) => <Button type="button" key={screen} size="sm" variant="outline" tone="neutral" leftIcon={<Icon aria-hidden />} data-encounter-discard onClick={() => props.onManageScene?.(scene, screen)}>{label}</Button>)}</nav>}
        <section className={styles.toolSection}><h4>Scene cast</h4><SceneTracker key={scene.id} state={state} scene={scene} readOnly={readOnly} /></section>
      </> : <section className={styles.toolSection}><h4>Revealed targets</h4><p className={styles.muted}>{scene.canPost ? 'Choose a revealed target to make your action.' : 'You are reading this scene. Only its cast can act or post.'}</p><ul className={styles.tracker}>{scene.participants.filter(entry => entry.kind === 'combatant' && entry.revealed).map(entry => <li className={styles.participant} key={entry.id}><Avatar size="sm" name={entry.name} src={entry.portraitUrl} /><div><strong title={entry.name}>{entry.name}</strong><span className={styles.muted}>Defense TN {entry.defenseTN ?? '—'}</span></div><Button type="button" size="sm" variant="outline" disabled={readOnly || !actor} onClick={() => actor && setAction({ sceneId: scene.id, actorId: actor.id, targetId: entry.id })}>Target</Button></li>)}</ul></section>}
      <section className={styles.toolSection}><h4>Recent exchanges</h4>{state.exchanges.isLoading ? <Loader size="sm" label="Loading exchanges…" /> : state.exchanges.isError ? <p className={styles.error}>Exchanges unavailable. <Button type="button" variant="outline" onClick={() => void state.exchanges.refetch()}>Retry</Button></p> : !exchanges.length ? <p className={styles.muted}>No actions have been rolled in this scene.</p> : exchanges.map(entry => <div key={entry.id}><SceneExchange exchange={entry} />{!readOnly && entry.status === 'pending' && (scene.canManage || scene.participants.some(participant => participant.id === entry.targetParticipantId && participant.kind === 'character' && participant.ownerPlayerId === viewerId)) && <Button type="button" size="sm" variant="outline" disabled={state.busy} onClick={() => setDefenseSnapshot(entry)}>Roll defense</Button>}</div>)}</section>
      {action?.sceneId === scene.id && <SceneRollModal key={`${scene.id}:${action.actorId}`} open={canAct && !accessPending} suspended={canAct && accessPending} busy={state.busy} title="Make an action" name={actionActor?.name ?? 'Participant unavailable'} portraitUrl={actionActor?.portraitUrl} onClose={() => setAction(null)}><SceneAttack {...props} scene={scene} actorParticipantId={action.actorId} initialTargetId={action.targetId} onClose={() => setAction(null)} /></SceneRollModal>}
      {defense && <SceneRollModal key={defense.id} open={canDefend && !accessPending} suspended={canDefend && accessPending} busy={state.busy} title="Roll defense" name={defense.targetName} portraitUrl={defenseTarget?.portraitUrl} onClose={() => setDefenseSnapshot(null)}><SceneDefense state={state} scene={scene} exchange={defense} characterState={characterState} onClose={() => setDefenseSnapshot(null)} /></SceneRollModal>}
    </div>}
    <SceneOverlap state={state} />
    {state.error && <div className={styles.error} role="alert">{state.error}<Button type="button" variant="outline" size="sm" disabled={state.busy} onClick={() => void state.refresh()}>Refresh scene</Button></div>}
    <p className={styles.status} role="status">{state.busy ? 'Saving…' : state.notice}</p>
  </section>;
}
