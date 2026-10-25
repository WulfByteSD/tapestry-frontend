'use client';
import { createElement, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { RichTextEditor } from '@tapestry/ui';
import { editorHtml, parseProseHtml, PROSE_PREFIX, storeProse } from './prose.helpers';
import type { ProseNode, ProseProps, RichFieldProps } from './authoring.types';
import styles from './Authoring.module.scss';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export default function AuthoringRichField({ id, label, value, onChange, hint, error, maxLength = 100000, minHeight = 180, disabled }: RichFieldProps) {
  const wrapper = useRef<HTMLDivElement>(null), ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot), [parentDisabled, setParentDisabled] = useState(false);
  useEffect(() => {
    const fieldset = wrapper.current?.closest('fieldset[aria-label]');
    const sync = () => { setParentDisabled(fieldset?.hasAttribute('disabled') ?? false); const textbox = wrapper.current?.querySelector('[contenteditable]'); textbox?.setAttribute('aria-label', label); textbox?.setAttribute('aria-describedby', `${id}-hint`); };
    const observer = new MutationObserver(sync); if (fieldset) observer.observe(fieldset, { attributes: true, attributeFilter: ['disabled'] });
    if (wrapper.current) observer.observe(wrapper.current, { childList: true, subtree: true }); sync();
    return () => observer.disconnect();
  }, [id, label]);
  return <div ref={wrapper} className={styles.richField} data-prose-field={id}><span className={styles.label}>{label}</span>{ready && <RichTextEditor value={editorHtml(value)} onChange={html => { const next = storeProse(html); if (next !== storeProse(editorHtml(value))) onChange(next); }} minHeight={minHeight} disabled={disabled || parentDisabled} />}
    <p id={`${id}-hint`} className={styles.hint}>{hint ?? 'Use the toolbar to format this text.'}</p>{(error || value.length > maxLength) && <p role="alert" className={styles.error}>{error || `This field exceeds ${maxLength.toLocaleString()} stored characters. Shorten it before saving.`}</p>}</div>;
}
function renderNodes(nodes: ProseNode[], prefix = ''): React.ReactNode[] {
  return nodes.map((node, i) => node.text !== undefined ? node.text : createElement(node.tag!, { key: `${prefix}${i}`, ...(node.href ? { href: node.href, target: '_blank', rel: 'noopener noreferrer' } : {}), ...(node.start ? { start: node.start } : {}) }, ...renderNodes(node.children ?? [], `${prefix}${i}-`)));
}
export function AuthoringProse({ value, className = '', fallback = '' }: ProseProps) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  if (!value.startsWith(PROSE_PREFIX)) return <div className={`${styles.prose} ${styles.plain} ${className}`}>{value || fallback}</div>;
  return <div className={`${styles.prose} ${className}`}>{ready ? renderNodes(parseProseHtml(value.slice(PROSE_PREFIX.length))) : null}</div>;
}
