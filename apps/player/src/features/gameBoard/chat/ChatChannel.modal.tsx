import { useEffect, useId, useRef, useState } from 'react';
import { Button, SelectField, TextField } from '@tapestry/ui';
import type { ChatMode, ChatVisibility } from '@tapestry/types';
import { createChatChannel, updateChatChannel } from '@tapestry/api-client';
import { api } from '@/lib/api';
import { chatError } from './Chat.helpers';
import type { ChatChannelModalProps } from './ChatChannel.types';
import styles from './Chat.module.scss';

export function ChatChannelModal({ campaign, channel, onClose, onSaved }: ChatChannelModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const headingId = useId();
  const [name, setName] = useState(channel?.name ?? '');
  const [mode, setMode] = useState<ChatMode>(channel?.mode ?? 'ic');
  const [visibility, setVisibility] = useState<ChatVisibility>(channel?.visibility ?? 'campaign');
  const [participants, setParticipants] = useState(channel?.participantPlayerIds ?? []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const archived = campaign.status === 'archived';
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement;
    dialogRef.current?.showModal();
  }, []);

  const save = async (action: 'save' | 'archive' | 'reopen') => {
    if (pending || archived) return;
    setPending(true);
    setError('');
    try {
      if (channel) await updateChatChannel(api, campaign._id, channel.id, action === 'archive' ? { archived: true } : action === 'reopen' ? { archived: false } : { name: name.trim(), ...(visibility === 'private' ? { participantPlayerIds: participants } : {}) });
      else await createChatChannel(api, campaign._id, { name: name.trim(), mode, visibility, ...(visibility === 'private' ? { participantPlayerIds: participants } : {}) });
      await onSaved();
      dialogRef.current?.close();
      // Access notifications can temporarily unmount this dialog during refresh.
      // Clear the parent's editor state even when no native dialog remains.
      onClose();
    } catch (caught) { setError(chatError(caught)); }
    finally { setPending(false); }
  };

  return (
    <dialog ref={dialogRef} className={styles.modal} aria-labelledby={headingId} onClose={() => { onClose(); openerRef.current?.focus(); }}>
      <div className={styles.modalHeader}><h2 id={headingId}>{channel ? 'Manage channel' : 'New channel'}</h2><Button type="button" autoFocus variant="outline" onClick={() => dialogRef.current?.close()}>Close</Button></div>
      <form className={styles.modalBody} onSubmit={(event) => { event.preventDefault(); void save('save'); }}>
        <TextField id="chat-channel-name" label="Channel name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required disabled={pending || archived || channel?.archived} />
        <div className={styles.twoFields}>
          <SelectField id="chat-channel-mode" label="Conversation" value={mode} onChange={(event) => setMode(event.target.value as ChatMode)} disabled={pending || archived || Boolean(channel)}><option value="ic">In character</option><option value="ooc">Out of character</option></SelectField>
          <SelectField id="chat-channel-visibility" label="Who can see it" value={visibility} onChange={(event) => setVisibility(event.target.value as ChatVisibility)} disabled={pending || archived || Boolean(channel)}><option value="campaign">Everyone at the table</option><option value="private">Selected participants</option></SelectField>
        </div>
        {visibility === 'private' ? <fieldset className={styles.participantList} disabled={pending || archived || channel?.archived}><legend>Participants</legend><p className={styles.help}>All Storyweavers and Co-Storyweavers always have access.</p>{campaign.members.map((member) => {
          const player = typeof member.player === 'object' ? member.player : null;
          if (!player) return null;
          const always = member.role === 'sw' || member.role === 'co-sw';
          return <label key={player._id}><input type="checkbox" checked={always || participants.includes(player._id)} disabled={always} onChange={(event) => setParticipants((previous) => event.target.checked ? [...previous, player._id] : previous.filter((id) => id !== player._id))} /><span>{player.displayName || 'Player'}{always ? ' · Storyweaver' : member.role === 'observer' ? ' · Observer' : ''}</span></label>;
        })}</fieldset> : null}
        {channel?.archived ? <p className={styles.help}>This channel is archived. Reopen it before changing its details or sending messages.</p> : null}
        {archived ? <p className={styles.help}>This campaign is archived. Channels are read-only.</p> : null}
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.modalActions}>{channel ? <Button type="button" variant="outline" disabled={pending || archived} onClick={() => void save(channel.archived ? 'reopen' : 'archive')}>{channel.archived ? 'Reopen channel' : 'Archive channel'}</Button> : null}{!channel?.archived ? <Button type="submit" isLoading={pending} disabled={archived || !name.trim()}>{channel ? 'Save changes' : 'Create channel'}</Button> : null}</div>
      </form>
    </dialog>
  );
}
