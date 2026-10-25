import { useState } from 'react';
import { Avatar, Button, SelectField, TextAreaField, Tooltip } from '@tapestry/ui';
import { FiChevronDown, FiFeather } from 'react-icons/fi';
import type { ChatSendInput } from '@tapestry/types';
import type { ChatComposerProps } from './ChatComposer.types';
import { messagePreview, speakerName } from './Chat.helpers';
import { ChatCompositionFields } from './ChatComposition.form';
import { compositionContent, emptyComposition } from './ChatComposition.helpers';
import styles from './Chat.module.scss';

export function ChatComposer({ channel, draft, currentUserId, playerName, isSW, readOnlyReason, characterState, onContent, onComposition, onClearReply, onDiscardAttempt, onSend }: ChatComposerProps) {
  const [identityFocused, setIdentityFocused] = useState(false);
  const ownCharacters = characterState.characters.filter((character) => character.player === currentUserId);
  const selected = ownCharacters.find((character) => character._id === characterState.activeCharacterId);
  const narrator = isSW && characterState.activeCharacterId === null;
  const validIdentity = channel.mode === 'ooc' || Boolean(selected) || narrator;
  const speaker: ChatSendInput['speaker'] = channel.mode === 'ooc' ? undefined : selected ? { type: 'character', characterId: selected._id } : narrator ? { type: 'narrator' } : undefined;
  const speakerLabel = channel.mode === 'ooc' ? playerName : selected?.name ?? 'Narrator';
  const retryIdentityDiffers = draft.attempt && JSON.stringify(draft.attempt.input.speaker) !== JSON.stringify(speaker);
  const sending = draft.status === 'sending';
  const unresolved = draft.status === 'failed';
  const characterFields = draft.attempt ? Boolean(draft.attempt.input.composition) : channel.mode === 'ic' && Boolean(selected);
  const composition = draft.composition ?? emptyComposition;
  const content = draft.attempt?.input.content ?? (characterFields ? compositionContent(composition) : draft.content);
  const canSend = !readOnlyReason && !sending && Boolean(content.trim()) && content.length <= 8000 && (validIdentity || Boolean(draft.attempt));
  const sendControl = <Tooltip title="Send · Ctrl/⌘ + Enter"><Button className={styles.sendMessage} size="sm" type="submit" disabled={!canSend} isLoading={sending}>{unresolved ? 'Retry original' : 'Send'}</Button></Tooltip>;

  if (readOnlyReason) return <div className={styles.readOnly}>{readOnlyReason}</div>;
  return (
    <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); if (canSend) void onSend(speaker, speakerLabel); }}>
      {!validIdentity ? <p className={styles.help}>Choose your character{isSW ? ' or Narrator' : ''} using the portrait menu.</p> : null}
      {draft.replyTo ? <div className={styles.composerReply}><span>Replying to <strong>{speakerName(draft.replyTo)}</strong>: {messagePreview(draft.replyTo).slice(0, 120)}</span><Button type="button" size="sm" variant="ghost" onClick={onClearReply} disabled={sending || unresolved}>Cancel reply</Button></div> : null}
      <div className={styles.composerMain}>
        <Tooltip title={channel.mode === 'ic' ? `Speaking as ${validIdentity ? speakerLabel : '…'} · Change speaker` : `${playerName} · Out of character`} visible={identityFocused ? true : undefined}>
          <div className={styles.composerIdentity}>
            {channel.mode === 'ic' ? <>
              <span className={styles.identityImage} aria-hidden="true">{narrator ? <FiFeather /> : <Avatar key={selected?.avatarUrl ?? selected?._id ?? 'none'} name={selected?.name ?? '?'} src={selected?.avatarUrl} size="sm" />}</span>
              <FiChevronDown className={styles.identityChevron} aria-hidden="true" />
              <SelectField id="chat-speaker" className={styles.identitySelect} aria-label={`Speaking as ${validIdentity ? speakerLabel : 'no character selected'}. Change speaker`} value={selected?._id ?? (narrator ? 'narrator' : '')} disabled={sending || unresolved} onFocus={() => setIdentityFocused(true)} onBlur={() => setIdentityFocused(false)} onChange={(event) => characterState.setActiveCharacter(event.target.value === 'narrator' ? null : event.target.value)}>
                {!selected && !narrator ? <option value="" disabled>Choose your character{isSW ? ' or Narrator' : ''}</option> : null}
                {isSW ? <option value="narrator">Narrator · Storyweaver</option> : null}
                {ownCharacters.map((character) => <option value={character._id} key={character._id}>{character.name}</option>)}
              </SelectField>
            </> : <Avatar name={playerName} alt={`${playerName} · Out of character`} size="sm" />}
          </div>
        </Tooltip>
        <div className={styles.composerEditor}>
      {characterFields ? <ChatCompositionFields id="chat-character" value={composition} disabled={sending || unresolved} onChange={onComposition} onKeyDown={(event) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
          event.preventDefault();
          if (canSend) void onSend(speaker, speakerLabel);
        }
      }} toolbarEnd={sendControl} /> : <><TextAreaField
        id="chat-message-input"
        aria-label={`Message ${channel.name}`}
        className={styles.messageInput}
        value={draft.content}
        onChange={(event) => onContent(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (canSend) void onSend(speaker, speakerLabel);
          }
        }}
        placeholder={channel.mode === 'ic' ? 'Continue the scene…' : 'Talk with your table…'}
        maxLength={8000}
        rows={2}
        disabled={sending || unresolved}
      /><div className={styles.composerFooter}><span className={styles.compositionCount} aria-label={`Message length: ${content.length} of 8000 characters`}>{content.length.toLocaleString()} / 8k</span>{sendControl}</div></>}
        </div>
      </div>
      {draft.error ? <p className={styles.error} role="alert">{draft.error}</p> : null}
      {draft.attempt ? <p className={styles.help}>Original attempt: <strong>{draft.attempt.speakerLabel}</strong> in <strong>{draft.attempt.channelName}</strong>.{retryIdentityDiffers ? ' Your current identity selection differs; Retry original still uses this original identity.' : ''}</p> : null}
      {unresolved ? <div className={styles.attemptActions}><p className={styles.help}>This message may already be posted. Retry original checks the same attempt. Before revising, check the conversation to avoid sending it twice.</p><Button type="button" variant="outline" onClick={onDiscardAttempt}>Discard attempt, keep draft</Button></div> : null}
    </form>
  );
}
