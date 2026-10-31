import { useEffect, useId, useRef } from 'react';
import { Avatar, Button } from '@tapestry/ui';
import type { SceneRollModalProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneRollModal({ open, suspended, busy, title, name, portraitUrl, onClose, children }: SceneRollModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) { openerRef.current ??= document.activeElement as HTMLElement; dialog.showModal(); }
    else if (!open && dialog.open) dialog.close();
    else if (!open && !suspended) onClose();
  }, [open, suspended, onClose]);
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => { queueMicrotask(() => {
      if (!dialog?.isConnected && openerRef.current?.isConnected && !openerRef.current.closest('[hidden]')) openerRef.current.focus();
    }); };
  }, []);
  return <dialog ref={dialogRef} className={styles.healthDialog} aria-labelledby={titleId} onCancel={event => { if (busy) event.preventDefault(); }} onClose={event => {
    if (event.target !== event.currentTarget || event.currentTarget.open || suspended) return;
    onClose();
    if (openerRef.current?.isConnected && !openerRef.current.closest('[hidden]')) openerRef.current.focus();
  }}>
    <header className={styles.healthHeader}><Avatar name={name} src={portraitUrl} size="sm" /><div><h2 id={titleId}>{title}</h2><p>{name}</p></div><Button type="button" size="sm" variant="outline" autoFocus disabled={busy} onClick={onClose}>Close</Button></header>
    <div className={styles.healthBody}>{children}</div>
  </dialog>;
}
