import { useEffect, useId, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiFeather } from 'react-icons/fi';
import { Avatar, Button } from '@tapestry/ui';
import type { ChatMessageProps } from './ChatMessage.types';
import { messageTime, speakerName } from './Chat.helpers';
import styles from './Chat.module.scss';
import { SceneExchange } from '../scenes/SceneExchange.component';
import { compositionParts } from './ChatComposition.helpers';

export function ChatMessage({ message, currentUserId, isSW, readOnly, replyDisabled, onReply, onEdit, onRemove }: ChatMessageProps) {
  const own = message.author.playerId === currentUserId;
  const character = message.speaker.type === 'character' || message.speaker.type === 'combatant';
  const narrator = message.speaker.type === 'narrator';
  const name = speakerName(message);
  const proseRef = useRef<HTMLDivElement>(null);
  const contentId = useId();
  const [expanded, setExpanded] = useState(false);
  const [long, setLong] = useState(false);
  useEffect(() => {
    const prose = proseRef.current;
    if (!prose) return;
    const observer = new ResizeObserver(() => setLong(prose.scrollHeight > 320));
    observer.observe(prose);
    return () => observer.disconnect();
  }, [message.content, message.deletedAt]);
  const collapsed = long && !expanded;
  const prose = (content: string) => <ReactMarkdown skipHtml allowedElements={['p', 'br', 'strong', 'em', 'del', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'code', 'pre', 'hr']} components={{ a: ({ href, children }) => collapsed ? <span className={styles.previewLink}>{children}</span> : <a href={href}>{children}</a> }}>{content}</ReactMarkdown>;
  if (message.systemEntry) return <div data-message-id={message.id}>{message.systemEntry.exchange ? <SceneExchange exchange={message.systemEntry.exchange} /> : <p className={styles.removed}>Exchange no longer available.</p>}</div>;
  return (
    <article className={`${styles.messageRow} ${character ? styles.characterMessage : ''} ${narrator ? styles.narratorMessage : ''}`} data-message-id={message.id}>
      {narrator ? <FiFeather className={styles.narratorIcon} aria-hidden="true" /> : <Avatar key={character ? message.speaker.avatar ?? name : message.author.avatar ?? name} className={character ? styles.characterPortrait : undefined} name={name} alt={character ? `${name} portrait` : message.author.displayName} src={character ? message.speaker.avatar : message.author.avatar} size={character ? 'lg' : 'sm'} />}
      <div className={styles.messageBody}>
        <div className={styles.messageMeta}><strong>{name}</strong>{message.speaker.type !== 'profile' ? <span>by {message.author.displayName}</span> : null}<time dateTime={message.createdAt} title={new Date(message.createdAt).toLocaleString()}>{messageTime(message.createdAt)}</time>{message.editedAt && !message.deletedAt ? <span>edited</span> : null}</div>
        {message.replyTo ? <blockquote className={styles.replyQuote}><strong>{speakerName(message.replyTo)}</strong><span>{message.replyTo.deletedAt ? 'Message removed' : message.replyTo.content.slice(0, 180)}</span></blockquote> : null}
        {message.deletedAt ? <p className={styles.removed}>Message removed</p> : <>
          <div id={contentId} className={!expanded ? styles.collapsedMessage : undefined}>
            <div ref={proseRef} className={styles.messageProse}>{message.composition ? compositionParts(message.composition).filter((part) => part.text.trim()).map((part, index) => part.type === 'dialogue' ? <blockquote key={index}><p>{part.text}</p></blockquote> : <div key={index}>{prose(part.text)}</div>) : prose(message.content)}</div>
          </div>
          {long && <Button className={styles.expandMessage} size="sm" variant="ghost" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Read full message'}</Button>}
        </>}
        {!readOnly && !message.deletedAt ? <div className={styles.messageActions}><button type="button" disabled={replyDisabled} onClick={() => onReply(message)}>Reply</button>{own ? <button type="button" onClick={() => onEdit(message)}>Edit</button> : null}{own || isSW ? <button type="button" onClick={() => onRemove(message)}>Remove</button> : null}</div> : null}
      </div>
    </article>
  );
}
