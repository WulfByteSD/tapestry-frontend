'use client';
import { useEffect, useRef } from 'react';
import { Button, MultiSelect } from '@tapestry/ui';
import type { MultiPickerProps } from './authoring.types';
import styles from './Authoring.module.scss';
export default function AuthoringMultiSelect({ id, label, value, onChange, options, hint, disabled }: MultiPickerProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => {
      wrapper.current?.querySelector('[role="combobox"]')?.setAttribute('aria-label', label);
      wrapper.current?.querySelectorAll('[role="listbox"] > div').forEach((node, i) => { node.setAttribute('role', 'option'); node.setAttribute('tabindex', options[i]?.disabled ? '-1' : '0'); node.setAttribute('aria-selected', String(value.includes(String(options[i]?.value)))); });
    };
    const observer = new MutationObserver(sync); if (wrapper.current) observer.observe(wrapper.current, { childList: true, subtree: true }); sync();
    return () => observer.disconnect();
  }, [label, options, value]);
  return <div ref={wrapper} className={styles.multiField} onKeyDownCapture={e => {
    const target = e.target as HTMLElement, trigger = wrapper.current?.querySelector<HTMLElement>('[role="combobox"]');
    if (target === trigger && ['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); trigger?.click(); requestAnimationFrame(() => wrapper.current?.querySelector<HTMLElement>('[role="option"][tabindex="0"]')?.focus()); }
    else if (target.getAttribute('role') === 'option') {
      const items = Array.from(wrapper.current?.querySelectorAll<HTMLElement>('[role="option"][tabindex="0"]') ?? []), index = items.indexOf(target);
      if (['Enter', ' '].includes(e.key)) { e.preventDefault(); target.click(); }
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); items[(index + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus(); }
      if (e.key === 'Escape') { e.preventDefault(); trigger?.click(); trigger?.focus(); }
    }
  }}><span className={styles.label}>{label}</span><MultiSelect id={id} value={value} options={options} disabled={disabled} onChange={values => onChange(values.map(String))} />{hint && <p className={styles.hint}>{hint}</p>}
    {!!value.length && <ul className={styles.selections}>{value.map(selected => <li key={selected}><span>{options.find(o => o.value === selected)?.label ?? selected}</span><Button type="button" variant="ghost" disabled={disabled} aria-label={`Remove ${label.toLowerCase()}: ${selected}`} onClick={() => onChange(value.filter(v => v !== selected))}>×</Button></li>)}</ul>}
  </div>;
}
