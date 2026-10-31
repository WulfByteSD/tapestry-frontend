import { useState } from 'react';
import { Avatar, Button, SelectField, TextField } from '@tapestry/ui';
import { ASPECT_BLOCKS, type SceneAttackInput, type EncounterExchange } from '@tapestry/types';
import { createSceneAttack } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { getAspectValue } from '@/features/characters/aspects/aspectutils';
import { getDefaultAttackAspect, getEquippedWeapons, normalizeSkills, titleCaseFromId } from '@/features/characters/characterSheetScreen/tabs/overview/attack.functions';
import { SceneExchange } from './SceneExchange.component';
import type { SceneAttackProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneAttack({ state, scene, actorParticipantId, initialTargetId, characterState, viewerId }: SceneAttackProps) {
  const actor = scene.participants.find(entry => entry.id === actorParticipantId);
  const npc = actor?.kind === 'combatant';
  const character = characterState.characters.find(entry => entry._id === actor?.characterId);
  const targets = scene.participants.filter(entry => entry.id !== actorParticipantId && (entry.kind === 'combatant' ? entry.revealed : npc));
  const [targetId, setTargetId] = useState(initialTargetId ?? '');
  const target = targets.find(entry => entry.id === targetId);
  const weapons = getEquippedWeapons(character);
  const attacks = actor?.snapshot && 'attacks' in actor.snapshot ? actor.snapshot.attacks ?? [] : [];
  const [kind, setKind] = useState<'weapon' | 'approach'>(npc ? attacks.length ? 'weapon' : 'approach' : weapons.length ? 'weapon' : 'approach');
  const [attackIndex, setAttackIndex] = useState(0);
  const [value, setValue] = useState(0);
  const [weaponId, setWeaponId] = useState(weapons[0]?.instanceId ?? '');
  const weapon = weapons.find(entry => entry.instanceId === weaponId);
  const [profileKey, setProfileKey] = useState(weapon?.selectedAttackProfileKey ?? weapon?.attackProfiles?.[0]?.key ?? '');
  const profile = weapon?.attackProfiles?.find(entry => entry.key === profileKey);
  const [aspect, setAspect] = useState(getDefaultAttackAspect(weapon, profileKey));
  const [skill, setSkill] = useState('');
  const [modifier, setModifier] = useState(0);
  const [edge, setEdge] = useState(false);
  const [burden, setBurden] = useState(false);
  const [attempt, setAttempt] = useState<SceneAttackInput | null>(null);
  const [result, setResult] = useState<EncounterExchange | null>(null);
  const skills = Object.entries(normalizeSkills(character?.sheet.skills)).filter(([key]) => kind === 'approach' || !profile?.allowedSkillKeys?.length || profile.allowedSkillKeys.includes(key));
  const allowed = !!actor && !!target && scene.status === 'open' && (npc ? scene.canManage && actor.revealed : actor.ownerPlayerId === viewerId && scene.playableCharacterIds.includes(actor.characterId ?? ''));
  const roll = async () => {
    if (!actor || !target || !allowed || state.busy) return;
    const input: SceneAttackInput = attempt ?? {
      requestKey: crypto.randomUUID(), actorParticipantId: actor.id, targetParticipantId: target.id, aspectKey: aspect,
      ...(npc ? { aspectValue: value, combatantAttackIndex: kind === 'weapon' ? attackIndex : undefined } : { skillKey: skill || undefined, weaponInstanceId: kind === 'weapon' ? weaponId : undefined, attackProfileKey: kind === 'weapon' ? profileKey || undefined : undefined }),
      modifier, edge, burden,
    };
    setAttempt(input);
    const response = await state.run(() => createSceneAttack(api, scene.campaignId, scene.encounterId, scene.id, input));
    if (response) setResult(response.payload);
  };
  const latestResult = state.exchanges.data?.payload.items.find(entry => entry.id === result?.id) ?? result;
  return <form className={styles.form} aria-busy={state.busy} onSubmit={event => { event.preventDefault(); void roll(); }}>
    {latestResult ? <><SceneExchange exchange={latestResult} /><p className={styles.muted}>Apply harm and conditions separately.</p><Button type="button" variant="outline" onClick={() => { setResult(null); setAttempt(null); }}>New action</Button></> : <>
      <fieldset disabled={state.busy || !!attempt}>
        <SelectField label="Target" required value={targetId} onChange={event => setTargetId(event.target.value)}><option value="">Choose a target</option>{targets.map(entry => <option key={entry.id} value={entry.id}>{entry.name}{entry.kind === 'character' ? ' · Character' : ''}</option>)}</SelectField>
        {target && <div className={styles.actionIdentity}><Avatar name={target.name} src={target.portraitUrl} size="sm" /><div><strong>{actor?.name} → {target.name}</strong><p className={styles.muted}>{scene.mode === 'opposed' ? 'Opposed defense · ties favor the defender' : `Defense TN ${target.defenseTN ?? '—'}`}</p></div></div>}
        {!targets.length && <p className={styles.muted}>No eligible targets. The Storyweaver must reveal NPCs before they can be targeted.</p>}
        <div className={styles.actionModes}>{(['weapon', 'approach'] as const).map(mode => <Button key={mode} type="button" size="sm" variant={kind === mode ? 'solid' : 'outline'} tone={kind === mode ? 'gold' : 'neutral'} aria-pressed={kind === mode} disabled={mode === 'weapon' && !(npc ? attacks.length : weapons.length)} onClick={() => { setKind(mode); setSkill(''); }}>{mode === 'weapon' ? npc ? 'Attack' : 'Weapon' : 'Approach'}</Button>)}</div>
        {kind === 'weapon' && (npc ? <><SelectField label="NPC attack" value={attackIndex} onChange={event => setAttackIndex(Number(event.target.value))}>{attacks.map((entry, index) => <option key={index} value={index}>{entry.name}</option>)}</SelectField>{attacks[attackIndex] && <p className={styles.muted}>{attacks[attackIndex].harm} harm{attacks[attackIndex].range ? ` · ${attacks[attackIndex].range}` : ''}{attacks[attackIndex].notes ? ` · ${attacks[attackIndex].notes}` : ''}</p>}</> : <><SelectField label="Equipped weapon" value={weaponId} onChange={event => { const next = weapons.find(entry => entry.instanceId === event.target.value); const nextProfile = next?.selectedAttackProfileKey ?? next?.attackProfiles?.[0]?.key ?? ''; setWeaponId(event.target.value); setProfileKey(nextProfile); setAspect(getDefaultAttackAspect(next, nextProfile)); setSkill(''); }}>{weapons.map(entry => <option key={entry.instanceId} value={entry.instanceId}>{entry.name ?? entry.itemKey}</option>)}</SelectField>{!!weapon?.attackProfiles?.length && <SelectField label="Attack profile" value={profileKey} onChange={event => { setProfileKey(event.target.value); setAspect(getDefaultAttackAspect(weapon, event.target.value)); setSkill(''); }}>{weapon.attackProfiles.map(entry => <option key={entry.key} value={entry.key}>{entry.name}</option>)}</SelectField>}</>)}
        <div className={styles.fields}>
          <SelectField label="Aspect" value={aspect} onChange={event => setAspect(event.target.value)}>{ASPECT_BLOCKS.map(block => <optgroup key={block.group} label={block.title}>{block.keys.map(entry => <option key={entry.key} value={`${block.group}.${entry.key}`}>{entry.label}{character ? ` (${getAspectValue(character, block.group, entry.key).toLocaleString('en-US', { signDisplay: 'always' })})` : ''}</option>)}</optgroup>)}</SelectField>
          {npc ? <TextField type="number" label="Aspect modifier" min={-20} max={20} required value={value} onChange={event => setValue(Number(event.target.value))} /> : <SelectField label="Skill" value={skill} onChange={event => setSkill(event.target.value)}><option value="">No skill</option>{skills.map(([key, rank]) => <option key={key} value={key}>{titleCaseFromId(key)} ({rank >= 0 ? '+' : ''}{rank})</option>)}</SelectField>}
        </div>
        <details className={styles.healthDetails}><summary>Roll options{edge || burden || modifier ? ` · ${[edge && 'Edge', burden && 'Burden', modifier && `${modifier > 0 ? '+' : ''}${modifier}`].filter(Boolean).join(' · ')}` : ''}</summary><div><TextField type="number" label="Situational modifier" min={-100} max={100} value={modifier} onChange={event => setModifier(Number(event.target.value))} /><div className={styles.rollOptions}><label><input type="checkbox" checked={edge} onChange={event => setEdge(event.target.checked)} /> Edge</label><label><input type="checkbox" checked={burden} onChange={event => setBurden(event.target.checked)} /> Burden</label></div></div></details>
      </fieldset>
      {state.error && <p role="alert" className={styles.error}>{state.error}</p>}
      {attempt && <p className={styles.muted}>Retry checks this same action with its original actor, target, and values. Check recent exchanges before discarding an unconfirmed attempt.</p>}
      <div className={styles.actions}><Button type="submit" disabled={!allowed || state.busy || (kind === 'weapon' && !(npc ? attacks[attackIndex] : weapon))} isLoading={state.busy}>{attempt ? 'Retry original action' : kind === 'weapon' ? 'Roll attack' : 'Roll Approach'}</Button>{attempt && <Button type="button" variant="ghost" disabled={state.busy} onClick={() => setAttempt(null)}>Discard attempt, keep values</Button>}</div>
    </>}
  </form>;
}
