import { useState } from 'react';
import { Avatar, Button } from '@tapestry/ui';
import { TbEye, TbEyeOff, TbHeart } from 'react-icons/tb';
import { updateEncounterScene } from '@tapestry/api-client';
import { api } from '@/lib/api';
import type { SceneTrackerProps } from './Scene.types';
import { SceneHealthModal } from './SceneHealth.modal';
import styles from './Scene.module.scss';

export function SceneTracker({ state, scene, readOnly }: SceneTrackerProps) {
  const [managingId, setManagingId] = useState<string | null>(null);
  const accessPending = state.refreshingAccess || state.detail.isLoading || state.detail.isError || state.list.isError;
  const canManageHealth = !readOnly && scene.canManage && scene.status === 'open';
  const reveal = async (id: string) => {
    const current = scene.participants.filter(entry => entry.kind === 'combatant' && entry.revealed).map(entry => entry.id);
    const revealedParticipantIds = current.includes(id) ? current.filter(entry => entry !== id) : [...current, id];
    await state.mutateScene(confirmed => updateEncounterScene(api, scene.campaignId, scene.encounterId, scene.id, { revision: scene.revision, revealedParticipantIds, confirmOverlap: confirmed }), 'NPC visibility updated.');
  };
  return <section aria-label="Combat tracker"><ul className={styles.tracker}>{scene.participants.map(entry => <li key={entry.id} className={styles.participant}>
    <Avatar name={entry.name} src={entry.portraitUrl} size="sm" />
    <div><strong title={entry.name}>{entry.name}</strong><p className={styles.muted}>{entry.kind === 'combatant' ? `${entry.revealed ? 'Revealed' : 'Hidden'} · Defense TN ${entry.defenseTN ?? '—'}` : 'Character'}</p></div>
    {entry.health && <span className={styles.vitals}><b>{entry.health.hp.current}</b><span> / {entry.health.hp.max} HP</span>{entry.health.hp.temp ? <small>+{entry.health.hp.temp} temporary</small> : null}</span>}
    {!!entry.health?.conditions.length && <p className={styles.conditions}>{entry.health.conditions.map(condition => condition.label ?? condition.key).join(' · ')}</p>}
    {!readOnly && scene.canManage && <div className={styles.rowControls}><Button type="button" size="sm" variant="outline" leftIcon={<TbHeart aria-hidden />} disabled={state.busy || !entry.health || !canManageHealth || accessPending} onClick={() => setManagingId(entry.id)}>Manage health</Button>{entry.kind === 'combatant' && <Button type="button" size="sm" variant="outline" tone="neutral" leftIcon={entry.revealed ? <TbEyeOff aria-hidden /> : <TbEye aria-hidden />} disabled={state.busy} onClick={() => void reveal(entry.id)}>{entry.revealed ? 'Hide from players' : 'Reveal to players'}</Button>}</div>}
  </li>)}</ul>{!scene.participants.length && <p className={styles.muted}>This scene has no cast yet.</p>}{managingId && <SceneHealthModal key={`${scene.id}:${managingId}`} open={canManageHealth && !accessPending && !!scene.participants.find(entry => entry.id === managingId)?.health} suspended={canManageHealth && accessPending} state={state} scene={scene} participantId={managingId} onClose={() => setManagingId(null)} />}</section>;
}
