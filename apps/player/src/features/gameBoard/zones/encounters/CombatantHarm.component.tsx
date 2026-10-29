'use client';
import { SelectField, TextField } from '@tapestry/ui';
import { harmBands } from './Combatant.choices';
import { parseHarm, validHarm } from './CombatantHarm.helpers';
import type { CombatantHarmProps, HarmBand } from './CombatantHarm.types';
import styles from './Encounter.module.scss';

export default function CombatantHarm({ value, onChange }: CombatantHarmProps) {
  const parsed = parseHarm(value);
  const band = parsed?.band;
  return <div className={styles.harmFields}>
    <SelectField label="Harm *" required value={band ?? (value ? 'legacy' : '')} options={[
      { value: '', label: 'Choose Harm' },
      ...Object.entries(harmBands).map(([value, [min, max]]) => ({ value, label: `${value} · ${max === Infinity ? `${min}+` : `${min}–${max}`}` })),
      ...(!band && value ? [{ value: 'legacy', label: `Existing: ${value}` }] : []),
    ]} onChange={event => {
      const next = event.target.value;
      if (next !== 'legacy') onChange(next ? `${next} (${harmBands[next as HarmBand][0]})` : '');
    }} />
    {band && (band === 'Brutal'
      ? <TextField label="Fixed Harm *" required type="number" min={10} step={1} value={parsed.amount} onChange={event => onChange(`${band} (${event.target.value})`)} />
      : <SelectField label="Fixed Harm *" required value={parsed.amount} options={[
        ...(parsed.amount === '' ? [{ value: '', label: 'Choose amount' }] : []),
        ...(!validHarm(value) && parsed.amount !== '' ? [{ value: parsed.amount, label: `Existing: ${parsed.amount} — choose amount` }] : []),
        ...Array.from({ length: harmBands[band][1] - harmBands[band][0] + 1 }, (_, index) => ({ value: String(harmBands[band][0] + index), label: String(harmBands[band][0] + index) })),
      ]} onChange={event => onChange(`${band} (${event.target.value})`)} />)}
  </div>;
}
