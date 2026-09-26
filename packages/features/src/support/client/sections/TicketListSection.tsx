'use client';

import React, { useState } from 'react';
import { Table, Button } from '@tapestry/ui';
import type { TableColumn } from '@tapestry/ui';
import type { AxiosInstance } from 'axios';
import type { ISupportTicket } from '@tapestry/types';
import { formatDate } from '@tapestry/utils';
import { CreateTicketModal } from './CreateTicketModal';
import styles from './TicketListSection.module.scss';

interface TicketListSectionProps {
  tickets: ISupportTicket[];
  loading: boolean;
  api: AxiosInstance;
  onSelect: (id: string) => void;
}

export function TicketListSection({ tickets, loading, api, onSelect }: TicketListSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const columns: TableColumn<ISupportTicket>[] = [
    {
      key: 'subject',
      title: 'Subject',
      dataIndex: 'subject',
      render: (value) => <span className={styles.subject}>{String(value)}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value) => <span className={`${styles.badge} ${styles[`status_${String(value)}`]}`}>{String(value).replace('_', ' ')}</span>,
    },
    {
      key: 'priority',
      title: 'Priority',
      dataIndex: 'priority',
      render: (value) => <span className={`${styles.badge} ${styles[`priority_${String(value)}`]}`}>{String(value)}</span>,
    },
    {
      key: 'category',
      title: 'Category',
      dataIndex: 'category',
      render: (value) => {
        const cats = value as string[];
        return <span className={styles.meta}>{cats?.join(', ') || '—'}</span>;
      },
    },
    {
      key: 'createdAt',
      title: 'Opened',
      dataIndex: 'createdAt',
      render: (value) => <span className={styles.meta}>{formatDate(String(value))}</span>,
    },
  ];

  return (
    <div className={styles.section}>
      <Table<ISupportTicket>
        columns={columns}
        rows={tickets}
        rowKey="_id"
        loading={loading}
        toolbar={
          <Button tone="gold" size="sm" onClick={() => setCreateOpen(true)}>
            New Ticket
          </Button>
        }
        onRowClick={(row) => onSelect(row._id)}
        emptyTitle="No tickets yet"
        emptyMessage="Submit a new ticket to get help from our support team."
      />
      <CreateTicketModal api={api} open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
