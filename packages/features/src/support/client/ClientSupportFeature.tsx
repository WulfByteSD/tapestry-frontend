'use client';

import React from 'react';
import { useTickets } from '@tapestry/hooks';
import { Loader, Button } from '@tapestry/ui';
import { TicketStatsRow } from './sections/TicketStatsRow';
import { TicketListSection } from './sections/TicketListSection';
import { TicketDetailSection } from './sections/TicketDetailSection';
import type { ClientSupportFeatureProps, ClientSupportDetailFeatureProps } from './ClientSupportFeature.types';
import styles from './ClientSupportFeature.module.scss';

export function ClientSupportFeature({ api, userId, onTicketSelect }: ClientSupportFeatureProps) {
  const { data: tickets = [], isLoading, isError } = useTickets(api, userId);

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Loader label="Loading support…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.state}>
        <p className={styles.error}>Unable to load support tickets. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TicketStatsRow tickets={tickets} />
      <TicketListSection tickets={tickets} loading={false} api={api} onSelect={onTicketSelect} />
    </div>
  );
}

export function ClientSupportDetailFeature({ api, userId, ticketId, onBack }: ClientSupportDetailFeatureProps) {
  return (
    <div className={styles.detailContainer}>
      {onBack && (
        <div className={styles.detailHeader}>
          <Button variant="ghost" tone="neutral" size="sm" onClick={onBack}>
            ← Back
          </Button>
        </div>
      )}
      <TicketDetailSection api={api} userId={userId} ticketId={ticketId} />
    </div>
  );
}
