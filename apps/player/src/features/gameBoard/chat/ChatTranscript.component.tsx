import { Button, Loader } from '@tapestry/ui';
import { ChatMessage } from './ChatMessage.component';
import { useChatScroll } from './Chat.scroll.hooks';
import type { ChatTranscriptProps } from './ChatTranscript.types';
import styles from './Chat.module.scss';

export function ChatTranscript(props: ChatTranscriptProps) {
  const { scrollRef, onScroll, toLatest, showLatest, hasNewMessages } = useChatScroll(props.channelId, props.messages, props.onRead);
  return (
    <div className={styles.transcriptFrame}>
      <div ref={scrollRef} className={styles.transcript} onScroll={onScroll} role="region" aria-label="Channel messages" tabIndex={0}>
        {props.hasOlder ? <div className={styles.older}><Button type="button" size="sm" variant="ghost" onClick={() => void props.onOlder()} isLoading={props.loadingOlder}>Load older messages</Button></div> : null}
        {props.loading ? <Loader label="Loading messages…" /> : props.error ? <div className={styles.empty}><p>Messages could not be loaded.</p><Button type="button" variant="outline" onClick={props.onRetry}>Try again</Button></div> : props.messages.length === 0 ? <p className={styles.empty}>The conversation starts here.</p> : props.messages.map((message) => <ChatMessage key={message.id} message={message} currentUserId={props.currentUserId} isSW={props.isSW} readOnly={props.readOnly} replyDisabled={props.replyDisabled} onReply={props.onReply} onEdit={props.onEdit} onRemove={props.onRemove} />)}
      </div>
      {showLatest ? <Button className={styles.latestButton} type="button" size="sm" onClick={toLatest}>{hasNewMessages ? 'New messages ↓' : 'Latest messages ↓'}</Button> : null}
    </div>
  );
}
