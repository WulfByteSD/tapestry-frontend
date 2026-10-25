import { useEffect, useId, useRef } from 'react';
import { QuickRollForm } from './QuickRoll.form';
import type { QuickRollProps } from './QuickRoll.types';
import styles from './QuickRoll.module.scss';

export function QuickRollModal({ open, onClose, ...props }: QuickRollProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={(event) => { if (dialogRef.current?.querySelector('form[aria-busy="true"]')) event.preventDefault(); }}
      onClose={(event) => { if (event.target !== event.currentTarget) return; onClose(); openerRef.current?.focus(); }}>
      <header className={styles.header}>
        <h2 id={titleId}>Quick Roll</h2>
        <p id={descriptionId}>Roll at {props.campaign.name}. Your result is saved to the campaign Feed.</p>
      </header>
      {open && <QuickRollForm key={props.characterState.activeCharacterId ?? 'self'} {...props} onClose={onClose} />}
    </dialog>
  );
}
