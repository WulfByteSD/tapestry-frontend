import { useState } from 'react';
import { ASPECT_BLOCKS, type EncounterExchange, type SceneDefenseInput } from '@tapestry/types';
import { Button, SelectField, TextField } from '@tapestry/ui';
import { defendSceneExchange } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { getAspectValue } from '@/features/characters/aspects/aspectutils';
import { normalizeSkills, titleCaseFromId } from '@/features/characters/characterSheetScreen/tabs/overview/attack.functions';
import { SceneExchange } from './SceneExchange.component';
import type { SceneDefenseProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneDefense({ state, scene, exchange, characterState }: SceneDefenseProps) {
  const target = scene.participants.find(entry => entry.id === exchange.targetParticipantId);
  const npc = target?.kind === 'combatant';
  const character = characterState.characters.find(entry => entry._id === target?.characterId);
  const skills = Object.entries(normalizeSkills(character?.sheet.skills));
  const [aspect, setAspect] = useState('finesse.agility');
  const [skill, setSkill] = useState('');
  const [value, setValue] = useState(0);
  const [modifier, setModifier] = useState(0);
  const [edge, setEdge] = useState(false);
  const [burden, setBurden] = useState(false);
  const [attempt, setAttempt] = useState<SceneDefenseInput | null>(null);
  const [result, setResult] = useState<EncounterExchange | null>(null);
  const latest = result ?? state.exchanges.data?.payload.items.find(entry => entry.id === exchange.id) ?? exchange;
  const allowed = scene.status === 'open' && !!target && (scene.canManage || (!npc && target.ownerPlayerId === state.viewerId));
  const roll = async () => {
    if (!allowed || state.busy) return;
    const input: SceneDefenseInput = attempt ?? { requestKey: crypto.randomUUID(), aspectKey: aspect, ...(npc ? { aspectValue: value } : { skillKey: skill || undefined }), modifier, edge, burden };
    setAttempt(input);
    const response = await state.run(() => defendSceneExchange(api, scene.campaignId, scene.encounterId, scene.id, exchange.id, input), 'Defense resolved. Apply harm or effects separately.');
    if (response) setResult(response.payload);
  };
  if (latest.status !== 'pending') return <div className={styles.form}><SceneExchange exchange={latest} /><p className={styles.muted}>Apply harm and conditions separately.</p></div>;
  return <form className={styles.form} aria-busy={state.busy} onSubmit={event => { event.preventDefault(); void roll(); }}>
    <p className={styles.muted}>{exchange.actorName} → <strong>{exchange.targetName}</strong> · Attack {exchange.attack.total}. Ties favor the defender.</p>
    <fieldset disabled={state.busy || !!attempt || !allowed}>
      <div className={styles.fields}><SelectField label="Defending Aspect" value={aspect} onChange={event => setAspect(event.target.value)}>{ASPECT_BLOCKS.map(block => <optgroup key={block.group} label={block.title}>{block.keys.map(entry => <option key={entry.key} value={`${block.group}.${entry.key}`}>{entry.label}{character ? ` (${getAspectValue(character, block.group, entry.key).toLocaleString('en-US', { signDisplay: 'always' })})` : ''}</option>)}</optgroup>)}</SelectField>
      {npc ? <TextField label="Aspect modifier" type="number" min={-20} max={20} required value={value} onChange={event => setValue(Number(event.target.value))} /> : <SelectField label="Skill" value={skill} onChange={event => setSkill(event.target.value)}><option value="">No skill</option>{skills.map(([key, rank]) => <option key={key} value={key}>{titleCaseFromId(key)} ({rank >= 0 ? '+' : ''}{rank})</option>)}</SelectField>}</div>
      <details className={styles.healthDetails}><summary>Roll options</summary><div><TextField label="Situational modifier" type="number" min={-100} max={100} value={modifier} onChange={event => setModifier(Number(event.target.value))} /><div className={styles.rollOptions}><label><input type="checkbox" checked={edge} onChange={event => setEdge(event.target.checked)} /> Edge</label><label><input type="checkbox" checked={burden} onChange={event => setBurden(event.target.checked)} /> Burden</label></div></div></details>
    </fieldset>
    {state.error && <p className={styles.error} role="alert">{state.error}</p>}
    {attempt && <p className={styles.muted}>Retry checks the original defense with the same values.</p>}
    <div className={styles.actions}><Button type="submit" disabled={!allowed || state.busy} isLoading={state.busy}>{attempt ? 'Retry original defense' : 'Roll defense'}</Button></div>
  </form>;
}
