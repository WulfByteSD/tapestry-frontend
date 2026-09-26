'use client';

import React from 'react';
import { Card, CardHeader, CardBody } from '@tapestry/ui';
import type { ISupportTicket } from '@tapestry/types';
import { formatDate } from '@tapestry/utils';
import styles from './TicketMetaPanel.module.scss';

interface TicketMetaPanelProps {
  ticket: ISupportTicket;
}

export function TicketMetaPanel({ ticket }: TicketMetaPanelProps) {
  return (
    <Card>
      <CardHeader>
        <p className={styles.panelTitle}>Ticket Details</p>
      </CardHeader>
      <CardBody>
        <div className={styles.fields}>
          <Field label="Ticket ID" value={ticket._id} mono />
          <Field label="Status">
            <span className={`${styles.badge} ${styles[`status_${ticket.status}`]}`}>{ticket.status.replace('_', ' ')}</span>
          </Field>
          <Field label="Priority">
            <span className={`${styles.badge} ${styles[`priority_${ticket.priority}`]}`}>{ticket.priority}</span>
          </Field>
          {ticket.category?.length > 0 && <Field label="Category" value={ticket.category.join(', ')} />}
          <Field label="Opened" value={formatDate(ticket.createdAt)} />
          {ticket.dateSolved && <Field label="Resolved" value={formatDate(ticket.dateSolved)} />}
        </div>
      </CardBody>
    </Card>
  );
}

interface FieldProps {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}

function Field({ label, value, mono, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children ?? <span className={`${styles.value} ${mono ? styles.mono : ''}`}>{value}</span>}
    </div>
  );
}
