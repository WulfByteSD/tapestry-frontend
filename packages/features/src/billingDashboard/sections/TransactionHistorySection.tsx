import React from 'react';
import type { ITransaction } from '@tapestry/types';
import { Card, CardHeader, CardBody, Table } from '@tapestry/ui';
import type { TableColumn } from '@tapestry/ui';
import { formatDate } from '@tapestry/utils';
import styles from './sections.module.scss';

interface TransactionHistorySectionProps {
  transactions: ITransaction[];
  isLoading?: boolean;
}

function StatusBadge({ status }: { status: ITransaction['status'] }) {
  const cls = (styles as Record<string, string>)[`badge_${status}`] ?? styles.badge_default;
  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}

const COLUMNS: TableColumn<ITransaction>[] = [
  {
    key: 'transactionDate',
    title: 'Date',
    render: (_val, row) => formatDate(row.transactionDate ?? row.createdAt),
  },
  {
    key: 'description',
    title: 'Description',
    render: (_val, row) => row.description ?? row.planInfo?.planName ?? '—',
  },
  {
    key: 'amount',
    title: 'Amount',
    align: 'right',
    render: (_val, row) => {
      const sign = row.type === 'refund' ? '-' : '';
      const amount = (row.amount / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: row.currency?.toUpperCase() ?? 'USD',
      });
      return `${sign}${amount}`;
    },
  },
  {
    key: 'status',
    title: 'Status',
    align: 'center',
    render: (_val, row) => <StatusBadge status={row.status} />,
  },
];

export function TransactionHistorySection({ transactions, isLoading }: TransactionHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <p className={styles.sectionTitle}>Payment History</p>
      </CardHeader>
      <CardBody>
        <Table<ITransaction>
          columns={COLUMNS}
          rows={transactions}
          rowKey="_id"
          loading={isLoading}
          emptyTitle="No transactions yet"
          emptyMessage="Payment history will appear here once you have an active subscription."
        />
      </CardBody>
    </Card>
  );
}
