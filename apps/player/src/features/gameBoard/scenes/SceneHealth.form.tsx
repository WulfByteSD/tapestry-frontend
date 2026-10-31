import { useRef, useState } from 'react';
import { Button, SelectField, TextField } from '@tapestry/ui';
import { applySceneHealth, previewSceneHealth } from '@tapestry/api-client';
import type { SceneHealthActionInput, SceneHealthPreview } from '@tapestry/types';
import { CONDITION_DEFINITIONS } from '@/features/characters/characterSheetScreen/tabs/conditions/conditionCatalog';
import { api } from '@/lib/api';
import type { SceneHealthProps } from './Scene.types';
import styles from './Scene.module.scss';

const healthActions = [
  ['harm', 'Harm'], ['heal', 'Heal'], ['set_hp', 'Set HP'],
  ['add_condition', 'Add condition'], ['remove_condition', 'Remove condition'],
] as const;

export function SceneHealth({ state, scene, participantId, onClose }: SceneHealthProps) {
  const participant = scene.participants.find(entry => entry.id === participantId);
  const [action, setAction] = useState<SceneHealthActionInput['action']>('harm');
  const [amount, setAmount] = useState(1);
  const [conditionKey, setConditionKey] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [exchangeId, setExchangeId] = useState('');
  const [allowBlockedWithoutCondition, setAllowBlocked] = useState(false);
  const [preview, setPreview] = useState<SceneHealthPreview | null>(null);
  const requestKey = useRef('');
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const definition = CONDITION_DEFINITIONS.find(entry => entry.key === conditionKey);
  const condition = conditionKey ? { key: conditionKey === 'custom' ? `custom:${customLabel.trim().toLowerCase().replace(/\s+/g, '-')}` : conditionKey, label: conditionKey === 'custom' ? customLabel.trim() : definition?.name, notes: conditionNotes.trim() || undefined } : undefined;
  const review = async (acknowledgeBlocked = allowBlockedWithoutCondition) => {
    const result = await state.run(() => previewSceneHealth(api, scene.campaignId, scene.encounterId, scene.id, { participantId, action, sourceParticipantId: sourceId || undefined, exchangeId: exchangeId || undefined, amount: ['harm', 'heal', 'set_hp'].includes(action) ? amount : undefined, condition, notes: notes.trim() || undefined, allowBlockedWithoutCondition: acknowledgeBlocked }));
    if (result) { setPreview(result.payload); setAllowBlocked(acknowledgeBlocked); requestKey.current = crypto.randomUUID(); }
  };
  const apply = async () => {
    if (!preview) return;
    const result = await state.run(() => applySceneHealth(api, scene.campaignId, scene.encounterId, scene.id, { token: preview.token, requestKey: requestKey.current }), 'Health and conditions updated.');
    if (result) onClose();
  };
  if (!participant) return null;
  return <form className={styles.form} aria-busy={state.busy} onSubmit={event => { event.preventDefault(); if (preview) void apply(); else void review(); }}>
    {participant.health && <dl className={styles.healthSnapshot}>
      <div><dt>Current HP</dt><dd><strong>{participant.health.hp.current}</strong><span> / {participant.health.hp.max}</span></dd></div>
      <div><dt>Temporary HP</dt><dd><strong>{participant.health.hp.temp}</strong></dd></div>
      <div className={styles.healthConditions}><dt>Active conditions</dt><dd>{participant.health.conditions.length ? participant.health.conditions.map(entry => entry.label ?? entry.key).join(' · ') : <span>None</span>}</dd></div>
    </dl>}
    <fieldset disabled={state.busy || !!preview}>
      <legend>Change</legend>
      <div className={styles.healthModes}>{healthActions.map(([value, label]) => <Button key={value} type="button" size="sm" variant={action === value ? 'solid' : 'outline'} tone={action === value ? 'gold' : 'neutral'} aria-pressed={action === value} onClick={() => {
        if (action === value) return;
        setAction(value); setConditionKey(''); setCustomLabel(''); setConditionNotes(''); setAllowBlocked(false);
      }}>{label}</Button>)}</div>
      <div className={styles.healthChangeFields} data-paired={action === 'harm'}>
        {['harm', 'heal', 'set_hp'].includes(action) && <TextField label={action === 'set_hp' ? 'New current HP' : action === 'heal' ? 'Healing amount' : 'Harm amount'} type="number" min={0} max={1000000} required value={amount} onChange={event => setAmount(Number(event.target.value))} />}
        {['harm', 'add_condition', 'remove_condition'].includes(action) && (action === 'remove_condition' && !participant.health?.conditions.length ? <p className={styles.muted}>No active conditions to remove.</p> : <SelectField label={action === 'harm' ? 'Condition with harm (optional)' : action === 'remove_condition' ? 'Condition to remove' : 'Condition to add'} required={action !== 'harm'} value={conditionKey} onChange={event => setConditionKey(event.target.value)}><option value="">{action === 'harm' ? 'No condition' : 'Choose condition'}</option>{action === 'remove_condition' ? participant.health?.conditions.map(entry => <option key={entry.key} value={entry.key}>{entry.label ?? entry.key}</option>) : <>{CONDITION_DEFINITIONS.map(entry => <option key={entry.key} value={entry.key}>{entry.name}</option>)}<option value="custom">Custom condition</option></>}</SelectField>)}
      </div>
      {['harm', 'add_condition', 'remove_condition'].includes(action) && <>
        {conditionKey === 'custom' && <TextField label="Custom condition" value={customLabel} required maxLength={100} onChange={event => setCustomLabel(event.target.value)} />}
        {definition && <p className={styles.muted}>{definition.summary}</p>}
        {!!conditionKey && action !== 'remove_condition' && <TextField label="Condition notes" value={conditionNotes} maxLength={1000} onChange={event => setConditionNotes(event.target.value)} />}
      </>}
      <details ref={detailsRef} className={styles.healthDetails}><summary>Details &amp; notes</summary><div>
      <SelectField label="Source (optional)" value={sourceId} onChange={event => setSourceId(event.target.value)}><option value="">Storyweaver ruling / environment</option>{scene.participants.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</SelectField>
      <SelectField label="Related exchange (optional)" value={exchangeId} onChange={event => { setExchangeId(event.target.value); const exchange = state.exchanges.data?.payload.items.find(entry => entry.id === event.target.value); if (exchange) setSourceId(exchange.actorParticipantId); }}><option value="">No linked exchange</option>{state.exchanges.data?.payload.items.filter(entry => entry.targetParticipantId === participantId && entry.status === 'resolved').map(entry => <option key={entry.id} value={entry.id}>{entry.actorName} → {entry.targetName} · {entry.attack.total}</option>)}</SelectField>
      <TextField label="Reason or notes" value={notes} maxLength={2000} onChange={event => setNotes(event.target.value)} />
      </div></details>
    </fieldset>
    {preview && <div className={styles.review} role="status"><h4>Confirm the change</h4><p>HP <strong>{preview.before.hp.current}/{preview.before.hp.max} → {preview.after.hp.current}/{preview.after.hp.max}</strong><br />Temporary HP {preview.before.hp.temp} → {preview.after.hp.temp}</p>{action === 'harm' && <p>Incoming harm {preview.incomingHarm} · Protection {preview.protection}<br />Effective harm {preview.effectiveHarm} · Absorbed by temporary HP {preview.tempAbsorbed}</p>}<p>Conditions: {preview.before.conditions.map(entry => entry.label ?? entry.key).join(', ') || 'None'} → {preview.after.conditions.map(entry => entry.label ?? entry.key).join(', ') || 'None'}</p>{preview.fullyBlocked && <p>Protection fully blocks this harm. Consider a condition if the fiction calls for it, or explicitly apply without a condition. Protection still blocks all harm.</p>}<>{preview.fullyBlocked && !condition && <label className={styles.muted}><input type="checkbox" disabled={state.busy || !notes.trim()} checked={allowBlockedWithoutCondition} onChange={event => { void review(event.target.checked); }} /> Apply without a condition (no HP loss){!notes.trim() && <span> · Revise the preview and add a reason in Details & notes first.</span>}</label>}</><p className={styles.muted}>This preview expires at {new Date(preview.expiresAt).toLocaleTimeString()}. If health changes meanwhile, review again.</p><Button type="button" size="sm" variant="outline" disabled={state.busy} onClick={() => { if (preview.fullyBlocked && !condition && !notes.trim() && detailsRef.current) detailsRef.current.open = true; setPreview(null); setAllowBlocked(false); }}>Revise / refresh preview</Button></div>}
    {state.error && <p className={styles.error} role="alert">{state.error}</p>}
    <div className={styles.actions}><Button type="submit" isLoading={state.busy} disabled={state.busy || (!preview && action === 'remove_condition' && !participant.health?.conditions.length) || (!!preview?.fullyBlocked && !condition && !allowBlockedWithoutCondition) || (!preview && (conditionKey === 'custom' && !customLabel.trim()))}>{preview ? 'Confirm and apply' : 'Preview change'}</Button></div>
    <p className={styles.muted}>No turns, Threads, or other effects are applied automatically.</p>
  </form>;
}
