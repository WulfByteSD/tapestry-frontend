import { useEffect, useId, useRef } from 'react';
import { Avatar, Button } from '@tapestry/ui';
import { SceneHealth } from './SceneHealth.form';
import type { SceneHealthModalProps } from './Scene.types';
import styles from './Scene.module.scss';

export function SceneHealthModal({ open, suspended, onClose, ...props }: SceneHealthModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const participant = props.scene.participants.find(entry => entry.id === props.participantId);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current ??= document.activeElement as HTMLElement;
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
    else if (!open && !suspended) onClose();
  }, [open, suspended, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      // Removing the dialog releases the native top layer. A deferred check
      // avoids closing or moving focus during Strict Mode's effect replay.
      queueMicrotask(() => {
        if (!dialog?.isConnected && openerRef.current?.isConnected && !openerRef.current.closest('[hidden]')) openerRef.current.focus();
      });
    };
  }, []);

  return <dialog ref={dialogRef} className={styles.healthDialog} aria-labelledby={titleId}
    onCancel={event => { if (props.state.busy) event.preventDefault(); }}
    onClose={event => {
      // Access refreshes temporarily close the dialog while preserving the form.
      if (event.target !== event.currentTarget || event.currentTarget.open || suspended) return;
      onClose();
      if (openerRef.current?.isConnected && !openerRef.current.closest('[hidden]')) openerRef.current.focus();
    }}>
    <header className={styles.healthHeader}>
      <Avatar name={participant?.name ?? ''} src={participant?.portraitUrl} size="sm" />
      <div><h2 id={titleId}>Manage health</h2><p>{participant?.name}</p></div>
      <Button type="button" size="sm" variant="outline" autoFocus disabled={props.state.busy} onClick={onClose}>Close</Button>
    </header>
    <div className={styles.healthBody}><SceneHealth {...props} onClose={onClose} /></div>
  </dialog>;
}
