'use client';
import { SelectField, TextField } from '@tapestry/ui';
import type { FormProps } from './unwoven.types';
import { numeric } from './unwoven.helpers';
import AuthoringListField from '@/features/authoring/AuthoringListField.component';
import { SettingsPicker, OriginPicker } from './UnwovenPickers.component';
import { tierOptions } from './unwoven.rules';
import styles from './Unwoven.module.scss';
const options = (values: string[]) => values.map(value => ({ value, label: value === 'npc' ? 'NPC' : value.charAt(0).toUpperCase() + value.slice(1) }));
export const categories = options(['unwoven', 'creature', 'npc', 'boss', 'ally', 'hazard']);
export function IdentityForm({ draft, onChange, issues, disabled }: FormProps) {
  const fieldError = (field: string) => issues.find(i => i.field === field)?.message;
  return <section className={styles.fields}><div className={styles.sectionHeading}><h2>Give the Unwoven an identity</h2><p>A name and a stable key anchor the entry. Classification helps you find it again.</p></div>
    <TextField id="name" label="Name" required value={draft.name} error={fieldError('name')} onChange={e => onChange({ ...draft, name: e.target.value })} />
    <TextField id="key" label="Catalog key" required hint="A stable identifier, such as hollow-watchkeeper. Saved in lowercase." value={draft.key} error={fieldError('key')} onChange={e => onChange({ ...draft, key: e.target.value })} />
    <div className={styles.grid}><SelectField id="category" label="Category" value={draft.category} options={categories} onChange={e => onChange({ ...draft, category: e.target.value as typeof draft.category })} />
      <SelectField id="disposition" label="Disposition" value={draft.disposition} options={options(['hostile', 'neutral', 'friendly'])} onChange={e => onChange({ ...draft, disposition: e.target.value as typeof draft.disposition })} /></div>
    <SettingsPicker draft={draft} onChange={onChange} issues={issues} disabled={disabled} />
    <SelectField id="tier" label="Tier" hint="1–5, from Fragile to Mythic. Existing unfamiliar values are preserved." value={draft.tier} options={[{ value: '', label: 'Choose a tier' }, ...tierOptions, ...(!tierOptions.some(o => o.value === draft.tier) && draft.tier ? [{ value: draft.tier, label: `Existing: ${draft.tier}` }] : [])]} onChange={e => onChange({ ...draft, tier: e.target.value })} /><OriginPicker draft={draft} onChange={onChange} issues={issues} disabled={disabled} /><div className={styles.grid}>{(['role'] as const).map(key => <TextField key={key} id={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={draft[key]} onChange={e => onChange({ ...draft, [key]: e.target.value })} />)}</div>
    <AuthoringListField id="perks" label="Perks" value={draft.perks} onChange={perks => onChange({ ...draft, perks })} />
  </section>;
}
export function BattleForm({ draft, onChange, issues }: FormProps) {
  const update = (patch: Partial<typeof draft.statline>) => onChange({ ...draft, statline: { ...draft.statline, ...patch } });
  return <section className={styles.fields}><div className={styles.sectionHeading}><h2>Shape its presence in a fight</h2><p>Enter the values for this Unwoven. Attacks can carry their own harm and range in the next area.</p></div>
    <div className={styles.stats}>{([['hp', 'HP', 1], ['defenseTN', 'Defense TN', 1], ['armor', 'Armor', 0], ['actions', 'Actions', 1]] as const).map(([key, label, min]) => <TextField key={key} id={key} label={label} required type="number" step="any" min={min} value={draft.statline[key]} error={issues.find(i => i.field === key)?.message} onChange={e => update({ [key]: numeric(e.target.value) })} />)}</div>
    <TextField id="move" label="Movement" value={draft.statline.move} onChange={e => update({ move: e.target.value })} />
    <AuthoringListField id="tags" label="Stat tags" value={draft.statline.tags} onChange={tags => update({ tags })} />
  </section>;
}
