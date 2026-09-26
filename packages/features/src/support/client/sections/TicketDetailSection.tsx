'use client';

import React from 'react';
import type { AxiosInstance } from 'axios';
import { useTicket } from '@tapestry/hooks';
import { Loader } from '@tapestry/ui';
import { MessageThread } from './MessageThread';
import { TicketMetaPanel } from './TicketMetaPanel';
import styles from './TicketDetailSection.module.scss';

interface TicketDetailSectionProps {
  api: AxiosInstance;
  userId: string;
  ticketId: string;
}

export function TicketDetailSection({ api, userId, ticketId }: TicketDetailSectionProps) {
  const { data: ticket, isLoading, isError } = useTicket(api, ticketId);

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Loader label="Loading ticket…" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className={styles.state}>
        <p className={styles.error}>Unable to load this ticket. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.thread}>
        <MessageThread api={api} userId={userId} ticketId={ticketId} subject={ticket.subject} status={ticket.status} />
      </div>
      <aside className={styles.meta}>
        <TicketMetaPanel ticket={ticket} />
      </aside>
    </div>
  );
}
