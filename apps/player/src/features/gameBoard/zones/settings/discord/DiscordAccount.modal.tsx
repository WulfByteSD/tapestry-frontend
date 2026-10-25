import { useEffect, useId, useRef } from 'react';
import { Button } from '@tapestry/ui';
import type { DiscordAccountModalProps } from './DiscordAccount.types';
import styles from './DiscordAccount.module.scss';

export function DiscordAccountModal({ open, account, busy, error, onClose, onLink, onUnlink }: DiscordAccountModalProps) {
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

  return <dialog ref={dialogRef} className={styles.modal} aria-labelledby={titleId} aria-describedby={descriptionId} onClose={() => { onClose(); if (openerRef.current?.isConnected) openerRef.current.focus(); }}>
    <header><h2 id={titleId}>{account.linked ? 'Your Discord account' : 'Link your Discord account'}</h2><Button variant="ghost" autoFocus onClick={() => dialogRef.current?.close()}>Close</Button></header>
    <div className={styles.modalBody}>
      <p id={descriptionId}>{account.linked ? 'Your verified Discord account is linked to your Tapestry player profile across campaigns.' : account.requirement === 'required' ? 'This campaign requires members to link a Discord account. You can dismiss this reminder and keep playing in Tapestry.' : 'Link a Discord account to your Tapestry player profile for campaigns that ask for one.'}</p>
      <p className={styles.help}>Linking verifies your account identity. It does not join a Discord server or verify server membership.</p>
      {account.readOnly ? <p className={styles.help}>This campaign is archived. Account linking is read-only here.</p> : !account.ready && !account.linked ? <p className={styles.help}>Discord linking is not configured on this server yet. You can keep playing and try again later.</p> : null}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <footer>
        <Button variant="outline" onClick={() => dialogRef.current?.close()}>{account.linked ? 'Done' : 'Keep playing'}</Button>
        {account.linked ? <Button variant="ghost" tone="danger" disabled={busy || account.readOnly} onClick={onUnlink}>Unlink my Discord account</Button> : <Button disabled={busy || account.readOnly || !account.ready} isLoading={busy} onClick={onLink}>Link Discord account</Button>}
      </footer>
    </div>
  </dialog>;
}
