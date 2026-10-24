'use client';
import { Button, TextField } from '@tapestry/ui';
import type { FormProps } from './unwoven.types';
import AuthoringRichField from '@/features/authoring/AuthoringRichField.component';
import HarmField from './HarmField.component';
import styles from './Unwoven.module.scss';
export default function UnwovenMoves({ draft, onChange, issues }: FormProps) {
  const error = (field: string) => issues.find(i => i.field === field)?.message;
  return <div className={styles.fields}>
    <section><div className={styles.sectionHeading}><h2>Attacks</h2><p>Describe what it does, the harm it deals, and any limits on reach.</p></div>
      {!draft.attacks.length && <p>No attacks yet. Add one, or supply the required stat-block summary below for an entry without attacks.</p>}
      {draft.attacks.map((attack, i) => <fieldset key={i} className={styles.entry}><legend>Attack {i + 1}</legend><div className={styles.grid}>{(['name', 'range'] as const).map(key => <TextField key={key} id={`attack-${i}-${key}`} label={key.charAt(0).toUpperCase() + key.slice(1)} required={key === 'name'} value={attack[key]} error={error(`attack-${i}-${key}`)} onChange={e => onChange({ ...draft, attacks: draft.attacks.map((a, n) => n === i ? { ...a, [key]: e.target.value } : a) })} />)}</div>
        <HarmField id={`attack-${i}-harm`} value={attack.harm} error={error(`attack-${i}-harm`)} onChange={harm => onChange({ ...draft, attacks: draft.attacks.map((a, n) => n === i ? { ...a, harm } : a) })} />
        <AuthoringRichField id={`attack-${i}-notes`} label="Attack notes" value={attack.notes} onChange={notes => onChange({ ...draft, attacks: draft.attacks.map((a, n) => n === i ? { ...a, notes } : a) })} />
        <Button type="button" variant="ghost" tone="danger" onClick={() => onChange({ ...draft, attacks: draft.attacks.filter((_, n) => n !== i) })}>Remove attack {i + 1}</Button></fieldset>)}
      <Button type="button" variant="outline" onClick={() => onChange({ ...draft, attacks: [...draft.attacks, { name: '', harm: '', range: '', notes: '' }] })}>Add attack</Button>
    </section>
    <section className={styles.divider}><div className={styles.sectionHeading}><h2>Abilities</h2><p>Write the full effect and an optional cooldown. These belong to this entry.</p></div>
      {!draft.abilities.length && <p>No abilities yet. A simple stat block is enough to start.</p>}
      {draft.abilities.map((ability, i) => <fieldset key={i} className={styles.entry}><legend>Ability {i + 1}</legend><div className={styles.grid}>
        <TextField id={`ability-${i}-name`} label="Ability name" required value={ability.name} error={error(`ability-${i}-name`)} onChange={e => onChange({ ...draft, abilities: draft.abilities.map((a, n) => n === i ? { ...a, name: e.target.value } : a) })} />
        <TextField id={`ability-${i}-cooldown`} label="Cooldown" value={ability.cooldown} onChange={e => onChange({ ...draft, abilities: draft.abilities.map((a, n) => n === i ? { ...a, cooldown: e.target.value } : a) })} /></div>
        <AuthoringRichField id={`ability-${i}-text`} label="Ability effect" value={ability.text} error={error(`ability-${i}-text`)} onChange={text => onChange({ ...draft, abilities: draft.abilities.map((a, n) => n === i ? { ...a, text } : a) })} />
        <Button type="button" variant="ghost" tone="danger" onClick={() => onChange({ ...draft, abilities: draft.abilities.filter((_, n) => n !== i) })}>Remove ability {i + 1}</Button></fieldset>)}
      <Button type="button" variant="outline" onClick={() => onChange({ ...draft, abilities: [...draft.abilities, { name: '', text: '', cooldown: '' }] })}>Add ability</Button>
    </section>
    <details className={styles.divider}><summary>Advanced: stat-block harm summary</summary><p>New entries use the first attack when this is blank. For an entry without attacks, choose a summary explicitly. Existing summaries stay unchanged for compatibility; attacks each keep their own harm.</p><HarmField id="harm" label="Stat-block summary" value={draft.statline.harm} error={error('harm')} onChange={harm => onChange({ ...draft, statline: { ...draft.statline, harm } })} /></details>
  </div>;
}
