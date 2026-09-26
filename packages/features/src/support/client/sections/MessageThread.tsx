'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardBody, Button, TextArea } from '@tapestry/ui';
import { useTicketMessages, useSendMessage } from '@tapestry/hooks';
import type { AxiosInstance } from 'axios';
import type { TicketStatus } from '@tapestry/types';
import { timeDifference } from '@tapestry/utils';
import styles from './MessageThread.module.scss';

interface MessageThreadProps {
  api: AxiosInstance;
  userId: string;
  ticketId: string;
  subject: string;
  status: TicketStatus;
}

export function MessageThread({ api, userId, ticketId, subject, status }: MessageThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const [reply, setReply] = useState('');

  const { data: messages = [], isLoading } = useTicketMessages(api, ticketId);
  const { mutate: sendMessage, isPending } = useSendMessage(api, ticketId);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!reply.trim()) return;
    sendMessage({ message: reply }, { onSuccess: () => setReply('') });
  };

  const isClosed = status === 'solved' || status === 'closed';

  return (
    <Card>
      <CardBody>
        <div className={styles.header}>
          <h2 className={styles.subject}>{subject}</h2>
          <span className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>{status.replace('_', ' ')}</span>
        </div>

        <div className={styles.thread} ref={threadRef}>
          {isLoading && <p className={styles.placeholder}>Loading messages…</p>}
          {!isLoading && messages.length === 0 && <p className={styles.placeholder}>No messages yet. Send a reply below.</p>}
          {messages.map((msg) => {
            const isOwn = msg.sender._id === userId;
            return (
              <div key={msg._id} className={`${styles.message} ${isOwn ? styles.own : styles.agent}`}>
                <div className={styles.bubble}>
                  <p className={styles.messageText}>{msg.message}</p>
                  <span className={styles.time}>{timeDifference(Date.now(), new Date(msg.createdAt))}</span>
                </div>
              </div>
            );
          })}
        </div>

        {!isClosed && (
          <div className={styles.replyBox}>
            <TextArea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" rows={3} resize="vertical" disabled={isPending} />
            <div className={styles.replyActions}>
              <Button tone="gold" onClick={handleSend} disabled={!reply.trim() || isPending}>
                {isPending ? 'Sending…' : 'Send Reply'}
              </Button>
            </div>
          </div>
        )}

        {isClosed && (
          <div className={styles.closedNotice}>
            <p>This ticket is {status}. No further replies can be added.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
