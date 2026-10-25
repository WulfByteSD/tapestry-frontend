'use client';
import { SelectField, TextField } from '@tapestry/ui';
import { harmBands, parseHarm } from './unwoven.rules';
import type { HarmBand } from './unwoven.rules';
import type { HarmFieldProps } from './unwoven.types';
import styles from './Unwoven.module.scss';
export default function HarmField({ id, value, onChange, label = 'Harm', error }: HarmFieldProps) {
  const parsed = parseHarm(value), incomplete = /^(Light|Standard|Heavy|Brutal) \(\)$/.exec(value);
  const band = parsed?.band ?? incomplete?.[1] as HarmBand | undefined;
  return <div><div className={styles.grid}><SelectField id={id} label={label} value={band ?? (value ? 'legacy' : '')} error={error} options={[{ value: '', label: 'Choose a harm band' }, ...Object.entries(harmBands).map(([value, [min, max]]) => ({ value, label: `${value} · ${max === Infinity ? `${min}+` : `${min}–${max}`}` })), ...(!band && value ? [{ value: 'legacy', label: `Existing value: ${value}` }] : [])]} onChange={e => { if (e.target.value !== 'legacy') onChange(e.target.value ? `${e.target.value} (${harmBands[e.target.value as HarmBand][0]})` : ''); }} />
      {band && (band === 'Brutal' ? <TextField id={`${id}-amount`} label="Fixed harm" type="number" min={10} step={1} value={parsed?.amount ?? ''} onChange={e => onChange(`${band} (${e.target.value})`)} /> : <SelectField id={`${id}-amount`} label="Fixed harm" value={parsed?.amount ?? ''} options={Array.from({ length: harmBands[band][1] - harmBands[band][0] + 1 }, (_, i) => ({ value: harmBands[band][0] + i, label: String(harmBands[band][0] + i) }))} onChange={e => onChange(`${band} (${e.target.value})`)} />)}
    </div>{!band && value && <p className={styles.footnote}>This saved notation is preserved. Choose a rule-defined band only if you want to replace it.</p>}</div>;
}
