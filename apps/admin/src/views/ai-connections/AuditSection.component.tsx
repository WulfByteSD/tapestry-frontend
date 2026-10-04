'use client';
import { useState } from 'react';
import { Table } from '@tapestry/ui';
import { useMcpList } from '@/lib/mcp-admin/mcpAdmin.hooks';
import type { AuditEvent } from '@/lib/mcp-admin/mcpAdmin.types';
import { date, Json, Paging, QueryFeedback } from './McpShared.component';
import styles from './AiConnections.module.scss';

export default function AuditSection() {
  const [page, setPage] = useState(1); const query = useMcpList('audit', page, true);
  return <section className={styles.section} aria-labelledby="audit-heading"><div className={styles.sectionHeader}><div><h2 id="audit-heading">Connection audit</h2><p>Application events, newest first. This is not a complete infrastructure log.</p></div></div><QueryFeedback error={query.error} retry={() => void query.refetch()} /><Table<AuditEvent> rowKey="_id" rows={query.data?.records ?? []} loading={query.isFetching} emptyTitle="No audit events on this page" columns={[
    { key: 'when', title: 'When', render: (_, row) => date(row.createdAt) },
    { key: 'event', title: 'Event', render: (_, row) => <><strong>{row.event}</strong>{row.code && <small className={styles.identifier}>{row.code}</small>}</> },
    { key: 'actor', title: 'Actor / connection', render: (_, row) => <span className={styles.identifier}>{row.actorKey ?? '—'}{row.clientId && <><br />Client: {row.clientId}</>}{row.ownerId && <><br />Auth: {row.ownerId}</>}{row.grantId && <><br />Grant: {row.grantId}</>}</span> },
    { key: 'snapshots', title: 'Details', render: (_, row) => <details className={styles.details}><summary>Event snapshots</summary><Json value={{ eventId: row._id, operationId: row.operationId, target: row.target, before: row.before, after: row.after }} /></details> },
  ]} /><Paging page={page} count={query.data?.records.length ?? 0} busy={query.isFetching} onChange={setPage} /></section>;
}
