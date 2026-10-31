import { useState } from 'react';
import { Button, SelectField } from '@tapestry/ui';
import { getEncounterScene, transferSceneParticipants } from '@tapestry/api-client';
import { api } from '@/lib/api';
import type { SceneTransferProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneTransfer({ state, scene, onDone }: SceneTransferProps) {
  const [targetId, setTargetId] = useState('');
  const [ids, setIds] = useState<string[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const targets = state.list.data?.payload.filter(entry => entry.canManage && entry.id !== scene.id && entry.status === 'open' && entry.encounterId === scene.encounterId) ?? [];
  const move = async () => {
    const target = targets.find(entry => entry.id === targetId);
    if (!target) return;
    if (!reviewing) { setReviewing(true); return; }
    const result = await state.run(async () => {
      const destination = await getEncounterScene(api, scene.campaignId, target.encounterId, target.id);
      return transferSceneParticipants(api, scene.campaignId, scene.encounterId, scene.id, { revision: scene.revision, targetSceneId: target.id, targetRevision: destination.payload.revision, participantIds: ids });
    }, 'Cast moved. Health and conditions preserved.');
    if (result) onDone();
  };
  return <form className={styles.form} onSubmit={event => { event.preventDefault(); void move(); }}><h4>Move participants</h4><fieldset disabled={state.busy || reviewing}><SelectField label="Destination scene" value={targetId} onChange={event => setTargetId(event.target.value)}><option value="">Choose a scene</option>{targets.map(target => <option key={target.id} value={target.id}>{target.encounterTitle} · {target.title}</option>)}</SelectField><div className={styles.checks}>{scene.participants.map(entry => <label key={entry.id}><input type="checkbox" checked={ids.includes(entry.id)} onChange={() => setIds(ids.includes(entry.id) ? ids.filter(id => id !== entry.id) : [...ids, entry.id])} />{entry.name}</label>)}</div></fieldset><p className={styles.muted}>This moves participants; it does not make copies. Existing readers remain in the source scene.</p>{reviewing && <div className={styles.review} role="status"><h4>Confirm the move</h4><p>Move {ids.length} participant{ids.length === 1 ? '' : 's'} to <strong>{targets.find(entry => entry.id === targetId)?.title}</strong>: {scene.participants.filter(entry => ids.includes(entry.id)).map(entry => entry.name).join(', ')}.</p><p>Health and conditions stay with the cast. Source turn slots are removed and destination slots appended. Pending exchanges involving the moved cast are cancelled. Existing readers remain until you remove them.</p><Button type="button" variant="outline" disabled={state.busy} onClick={() => setReviewing(false)}>Back to selection</Button></div>}<div className={styles.actions}><Button type="submit" disabled={state.busy || !targetId || !ids.length} isLoading={state.busy}>{reviewing ? 'Confirm move' : 'Review move'}</Button><Button type="button" variant="ghost" disabled={state.busy} onClick={onDone}>Cancel</Button></div></form>;
}
