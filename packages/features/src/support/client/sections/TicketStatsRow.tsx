'use client';

import React from 'react';
import { Card, CardBody } from '@tapestry/ui';
import type { ISupportTicket } from '@tapestry/types';
import styles from './TicketStatsRow.module.scss';

interface TicketStatsRowProps {
  tickets: ISupportTicket[];
  loading?: boolean;
}

export function TicketStatsRow({ tickets, loading }: TicketStatsRowProps) {
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === 'open' || t.status === 'new' || t.status === 'pending' || t.status === 'on_hold').length;
  const solved = tickets.filter((t) => t.status === 'solved' || t.status === 'closed').length;

  return (
    <div className={styles.row}>
      <StatCard label="Total Tickets" value={total} loading={loading} />
      <StatCard label="Open Tickets" value={open} loading={loading} accent="blue" />
      <StatCard label="Resolved Tickets" value={solved} loading={loading} accent="green" />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  loading?: boolean;
  accent?: 'blue' | 'green';
}

function StatCard({ label, value, loading, accent }: StatCardProps) {
  return (
    <Card className={styles.statCard}>
      <CardBody>
        <p className={styles.label}>{label}</p>
        {loading ? <span className={styles.skeleton} /> : <p className={`${styles.value} ${accent ? styles[`accent_${accent}`] : ''}`}>{value}</p>}
      </CardBody>
    </Card>
  );
}
