'use client';
import { useCallback, type ReactNode } from 'react';
import { Button, Modal } from '@tapestry/ui';
import { mcpErrorMessage, useMcpCooldown, type useMcpAction } from '@/lib/mcp-admin/mcpAdmin.hooks';
import styles from './AiConnections.module.scss';

export function Dialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  // Shared Modal mounts its portal after its first effect; attach focus behavior
  // when this content actually enters the document, rather than before the portal.
  const attachFocus = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const previous = document.activeElement as HTMLElement | null;
    const container = node.closest('[role="dialog"]') as HTMLElement | null;
    if (!container) return;
    container.setAttribute('aria-label', title);
    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')).filter(element => element.offsetParent !== null);
    node.tabIndex = -1;
    (node.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)') ?? focusable()[0] ?? node).focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = focusable(); const first = elements[0]; const last = elements.at(-1);
      if (!first) { event.preventDefault(); node.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    container.addEventListener('keydown', trap);
    return () => { container.removeEventListener('keydown', trap); previous?.focus(); };
  }, [title]);
  return <Modal open title={title} width="min(760px, calc(100vw - 24px))" footer={null} maskClosable={!busy} closable={!busy} onCancel={() => { if (!busy) onClose(); }} destroyOnClose><div ref={attachFocus}>{children}</div></Modal>;
}
export function ActionFeedback({ action }: { action: ReturnType<typeof useMcpAction> }) {
  const cooldown = useMcpCooldown();
  return action.error ? <div role="alert" className={styles.warning}><p>{action.error}</p>{action.retryable && <Button variant="outline" tone="neutral" disabled={action.pending || !!cooldown} onClick={() => void action.retry()}>Retry exact request{cooldown ? ` in ${cooldown}s` : ''}</Button>}<p>Retry keeps the original operation ID and submitted values. Changing inputs starts a new action.</p></div> : null;
}
export function QueryFeedback({ error, retry, record = false }: { error: unknown; retry: () => void; record?: boolean }) {
  const cooldown = useMcpCooldown();
  return error ? <div role="alert" className={styles.warning}><p>{mcpErrorMessage(error, record)}</p><Button variant="outline" tone="neutral" disabled={!!cooldown} onClick={retry}>Retry loading{cooldown ? ` in ${cooldown}s` : ''}</Button></div> : null;
}
export function Paging({ page, count, busy, onChange }: { page: number; count: number; busy: boolean; onChange: (page: number) => void }) {
  const cooldown = useMcpCooldown();
  return <div className={styles.paging}><Button variant="ghost" tone="neutral" disabled={page <= 1 || busy || !!cooldown} onClick={() => onChange(page - 1)}>Previous</Button><span>Page {page} · {count} records</span><Button variant="outline" tone="neutral" disabled={count < 25 || page >= 10000 || busy || !!cooldown} onClick={() => onChange(page + 1)}>Next</Button><small>A full page permits Next; the next page may be empty.</small></div>;
}
export function Json({ value }: { value: unknown }) { return <pre className={styles.json}>{JSON.stringify(value, null, 2)}</pre>; }
export function date(value?: string) { return value ? new Date(value).toLocaleString() : '—'; }
export function lines(value: string) { return [...new Set(value.split(/\r?\n/).map(part => part.trim()).filter(Boolean))]; }
export function Check({ label, checked, onChange, disabled, hint }: { label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; hint?: string }) {
  return <label className={styles.check}><input type="checkbox" checked={checked} disabled={disabled} onChange={event => onChange(event.target.checked)} /><span><strong>{label}</strong>{hint && <small>{hint}</small>}</span></label>;
}
export function validateCallbacks(callbacks: string[]) {
  if (!callbacks.length || callbacks.length > 10) throw new Error('Interactive applications need 1–10 exact callbacks.');
  for (const callback of callbacks) {
    let url: URL; try { url = new URL(callback); } catch { throw new Error(`Invalid callback: ${callback}`); }
    if (callback.includes('*') || callback.includes('#') || url.username || url.password || !(url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) throw new Error('Callbacks require HTTPS or HTTP localhost/127.0.0.1/[::1], without fragments, credentials, or wildcards.');
  }
}
