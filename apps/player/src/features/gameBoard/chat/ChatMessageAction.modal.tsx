import { useEffect, useId, useRef, useState } from 'react';
import { Button, TextAreaField } from '@tapestry/ui';
import { editChatMessage, removeChatMessage } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { chatError } from './Chat.helpers';
import type { ChatMessageModalProps } from './ChatMessageAction.types';
import styles from './Chat.module.scss';
import { ChatCompositionFields } from './ChatComposition.form';
import { compositionContent } from './ChatComposition.helpers';

export function ChatMessageModal({ campaignId, message, action, onClose, onSaved }: ChatMessageModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [content, setContent] = useState(message.content);
  const [composition, setComposition] = useState(message.composition);
  const effectiveContent = composition ? compositionContent(composition) : content;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { openerRef.current = document.activeElement as HTMLElement; dialogRef.current?.showModal(); }, []);
  const submit = async () => {
    if (pending || (action === 'edit' && (!effectiveContent.trim() || effectiveContent.length > 8000))) return;
    setPending(true);
    setError('');
    try {
      if (action === 'edit') await editChatMessage(api, campaignId, message.id, effectiveContent, composition);
      else await removeChatMessage(api, campaignId, message.id);
      await onSaved();
      dialogRef.current?.close();
    } catch (caught) { setError(chatError(caught)); }
    finally { setPending(false); }
  };
  return (
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby={titleId} onClose={() => { onClose(); openerRef.current?.focus(); }}>
      <div className={styles.modalHeader}><h2 id={titleId}>{action === 'edit' ? 'Edit message' : 'Remove message?'}</h2><Button type="button" variant="outline" autoFocus onClick={() => dialogRef.current?.close()}>Close</Button></div>
      <form className={styles.modalBody} onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        {action === 'edit' ? composition ? <ChatCompositionFields id="chat-edit-character" value={composition} onChange={setComposition} disabled={pending} /> : <TextAreaField id="chat-edit-message" label="Message" className={styles.messageInput} rows={7} maxLength={8000} value={content} onChange={(event) => setContent(event.target.value)} disabled={pending} /> : <p>The message content will be removed. A marker will remain in the conversation.</p>}
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.modalActions}><Button type="button" variant="outline" onClick={() => dialogRef.current?.close()}>Cancel</Button><Button type="submit" isLoading={pending} disabled={action === 'edit' && (!effectiveContent.trim() || effectiveContent.length > 8000)}>{action === 'edit' ? 'Save message' : 'Remove message'}</Button></div>
      </form>
    </dialog>
  );
}
