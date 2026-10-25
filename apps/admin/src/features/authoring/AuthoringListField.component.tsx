'use client';
import { useState } from 'react';
import { Button, TextField } from '@tapestry/ui';
import type { ListFieldProps } from './authoring.types';
import styles from './Authoring.module.scss';
export default function AuthoringListField({ id, label, value, onChange, hint, maxItems = 200, maxLength, disabled }: ListFieldProps) {
  const [entry, setEntry] = useState('');
  const add = () => { if (!disabled && entry.trim() && value.length < maxItems) { onChange([...value, entry.trim()]); setEntry(''); } };
  return <section className={styles.listField} aria-label={label}><h3>{label}</h3>{hint && <p className={styles.hint}>{hint}</p>}
    <ul>{value.map((item, i) => <li key={i}><TextField aria-label={`${label} item ${i + 1}`} value={item} maxLength={maxLength} disabled={disabled} onChange={e => onChange(value.map((v, n) => n === i ? e.target.value : v))} /><Button type="button" variant="ghost" tone="danger" disabled={disabled} aria-label={`Remove ${label.toLowerCase()} item ${i + 1}`} onClick={() => onChange(value.filter((_, n) => n !== i))}>Remove</Button></li>)}</ul>
    <div className={styles.addRow}><TextField id={id} label={`Add ${label.toLowerCase()}`} value={entry} maxLength={maxLength} disabled={disabled || value.length >= maxItems} onChange={e => setEntry(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} /><Button type="button" variant="outline" disabled={disabled || !entry.trim() || value.length >= maxItems} onClick={add}>Add</Button></div>
  </section>;
}
