'use client';
import { Button, SelectField, TextField } from '@tapestry/ui';
import type { CombatantFormProps } from './Encounter.types';
import CombatantHarm from './CombatantHarm.component';
import { originOptions, roleOptions, tierOptions, withExistingChoice } from './Combatant.choices';
import styles from './Encounter.module.scss';

export default function CombatantForm({ value, onChange, disabled }: CombatantFormProps) {
  return <fieldset disabled={disabled} className={styles.formFields}>
    <TextField label="Name *" required maxLength={200} value={value.name} onChange={e => onChange({ ...value, name: e.target.value })} />
    <div className={styles.twoColumns}>
      <SelectField label="Category" value={value.category} options={['unwoven', 'creature', 'npc', 'boss', 'ally', 'hazard'].map(v => ({ value: v, label: v === 'npc' ? 'NPC' : v.charAt(0).toUpperCase() + v.slice(1) }))} onChange={e => onChange({ ...value, category: e.target.value as typeof value.category })} />
      <SelectField label="Disposition" value={value.disposition} options={['hostile', 'neutral', 'friendly'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} onChange={e => onChange({ ...value, disposition: e.target.value as typeof value.disposition })} />
    </div>
    <div className={styles.threeColumns}>
      <SelectField label="Tier *" required value={value.tier ?? ''} options={[{ value: '', label: 'Choose tier' }, ...withExistingChoice(tierOptions, value.tier, true)]} onChange={e => onChange({ ...value, tier: e.target.value })} />
      <SelectField label="Origin (optional)" value={value.origin ?? ''} options={[{ value: '', label: 'None' }, ...withExistingChoice(originOptions, value.origin)]} onChange={e => onChange({ ...value, origin: e.target.value })} />
      <SelectField label="Role (optional)" value={value.role ?? ''} options={[{ value: '', label: 'None' }, ...withExistingChoice(roleOptions, value.role)]} onChange={e => onChange({ ...value, role: e.target.value })} />
    </div>
    <div className={styles.statGrid}>{([['hp', 'HP', 1], ['defenseTN', 'Defense TN', 1], ['armor', 'Armor', 0], ['actions', 'Actions', 1]] as const).map(([key, label, min]) => <TextField key={key} label={`${label} *`} required type="number" step={1} min={min} max={1000000} value={value.statline[key]} onChange={e => onChange({ ...value, statline: { ...value.statline, [key]: e.target.value === '' ? '' : Number(e.target.value) } })} />)}</div>
    <CombatantHarm value={value.statline.harm} onChange={harm => onChange({ ...value, statline: { ...value.statline, harm } })} />
    <TextField label="Move (optional)" maxLength={200} value={value.statline.move} onChange={e => onChange({ ...value, statline: { ...value.statline, move: e.target.value } })} />
    <section className={styles.formSection}><h3>Attacks</h3>
      {(value.attacks ?? []).map((attack, index) => <fieldset className={styles.entry} key={index}><legend>Attack {index + 1}</legend>
        <div className={styles.attackFields}>
          <TextField label="Attack name *" required maxLength={200} value={attack.name} onChange={e => onChange({ ...value, attacks: value.attacks?.map((entry, n) => n === index ? { ...entry, name: e.target.value } : entry) })} />
          <CombatantHarm value={attack.harm} onChange={harm => onChange({ ...value, attacks: value.attacks?.map((entry, n) => n === index ? { ...entry, harm } : entry) })} />
          <TextField label="Range (optional)" maxLength={200} value={attack.range ?? ''} onChange={e => onChange({ ...value, attacks: value.attacks?.map((entry, n) => n === index ? { ...entry, range: e.target.value } : entry) })} />
          <label className={styles.textareaLabel}>Effect / notes (optional)<textarea rows={2} maxLength={2000} value={attack.notes ?? ''} onChange={e => onChange({ ...value, attacks: value.attacks?.map((entry, n) => n === index ? { ...entry, notes: e.target.value } : entry) })} /></label>
        </div>
        <Button type="button" size="sm" variant="ghost" tone="danger" onClick={() => onChange({ ...value, attacks: value.attacks?.filter((_, n) => n !== index) })}>Remove attack {index + 1}</Button>
      </fieldset>)}
      <Button type="button" variant="outline" tone="neutral" size="sm" disabled={(value.attacks?.length ?? 0) >= 30} onClick={() => onChange({ ...value, attacks: [...(value.attacks ?? []), { name: '', harm: '', range: '', notes: '' }] })}>Add attack</Button>
    </section>
    <section className={styles.formSection}><h3>Abilities</h3>
      {(value.abilities ?? []).map((ability, index) => <fieldset className={styles.entry} key={index}><legend>Ability {index + 1}</legend>
        <div className={styles.twoColumns}><TextField label="Ability name *" required maxLength={200} value={ability.name} onChange={e => onChange({ ...value, abilities: value.abilities?.map((entry, n) => n === index ? { ...entry, name: e.target.value } : entry) })} /><TextField label="Cooldown (optional)" maxLength={200} value={ability.cooldown ?? ''} onChange={e => onChange({ ...value, abilities: value.abilities?.map((entry, n) => n === index ? { ...entry, cooldown: e.target.value } : entry) })} /></div>
        <label className={styles.textareaLabel}>Effect *<textarea required rows={3} maxLength={5000} value={ability.text} onChange={e => onChange({ ...value, abilities: value.abilities?.map((entry, n) => n === index ? { ...entry, text: e.target.value } : entry) })} /></label>
        <Button type="button" size="sm" variant="ghost" tone="danger" onClick={() => onChange({ ...value, abilities: value.abilities?.filter((_, n) => n !== index) })}>Remove ability {index + 1}</Button>
      </fieldset>)}
      <Button type="button" variant="outline" tone="neutral" size="sm" disabled={(value.abilities?.length ?? 0) >= 30} onClick={() => onChange({ ...value, abilities: [...(value.abilities ?? []), { name: '', text: '', cooldown: '' }] })}>Add ability</Button>
    </section>
    <TextField label="Portrait URL (optional)" type="url" maxLength={2048} value={value.media?.portraitUrl ?? ''} onChange={e => onChange({ ...value, media: { ...value.media, portraitUrl: e.target.value } })} />
    <label className={styles.textareaLabel}>Storyweaver notes<textarea rows={3} maxLength={20000} value={value.notes?.gm ?? ''} onChange={e => onChange({ ...value, notes: { ...value.notes, gm: e.target.value } })} /></label>
  </fieldset>;
}
