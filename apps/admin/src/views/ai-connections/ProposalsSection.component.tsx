'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, SelectField, Table } from '@tapestry/ui';
import { decideProposal } from '@/lib/mcp-admin/mcpAdmin.api';
import { useMcpAction, useMcpCooldown, useMcpList, useMcpProposal } from '@/lib/mcp-admin/mcpAdmin.hooks';
import type { Decision, Proposal, ProposalState } from '@/lib/mcp-admin/mcpAdmin.types';
import { ActionFeedback, Check, date, Dialog, Json, Paging, QueryFeedback } from './McpShared.component';
import styles from './AiConnections.module.scss';

function ProposalDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const query = useMcpProposal(id); const action = useMcpAction(); const cooldown = useMcpCooldown(); const queryClient = useQueryClient();
  const [note, setNote] = useState(''); const [acknowledged, setAcknowledged] = useState(false); const [conflict, setConflict] = useState(false);
  const proposal = query.data;
  const publicationImpact = proposal?.operation.action === 'update' || proposal?.operation.data.status === 'published';
  const decide = (decision: 'approve' | 'reject') => {
    if (!proposal || proposal.state !== 'pending' || (decision === 'approve' && publicationImpact && !acknowledged)) return;
    const body: Decision = { operationId: crypto.randomUUID(), ...(note.trim() ? { note: note.trim() } : {}) };
    void action.run(() => decideProposal(id, decision, body), result => {
      queryClient.setQueryData(['mcp-admin', 'proposal', id], result);
      setConflict(false);
    }, () => { setConflict(true); void query.refetch(); }, decision === 'approve');
  };
  return <Dialog title="Review stored content proposal" onClose={onClose} busy={action.pending}><QueryFeedback error={query.error} retry={() => void query.refetch()} record />{query.isFetching && <p role="status">Loading proposal…</p>}
    {proposal && <div className={styles.form}>
      <dl className={styles.metadata}><dt>State</dt><dd>{proposal.state}</dd><dt>Client</dt><dd><code>{proposal.clientId}</code></dd><dt>Owner Auth ID</dt><dd><code>{proposal.ownerId}</code></dd><dt>Grant</dt><dd><code>{proposal.grantId}</code></dd><dt>Submitted</dt><dd>{date(proposal.createdAt)}</dd><dt>Operation</dt><dd>{proposal.operation.action} {proposal.operation.type}</dd>{proposal.operation.action === 'update' && <><dt>Record</dt><dd><code>{proposal.operation.id}</code></dd><dt>Stored revision</dt><dd><code>{proposal.operation.revision}</code></dd></>}<dt>Historical scope</dt><dd>{proposal.settingKeys.join(', ') || 'No setting keys'} · shared access {proposal.requiresShared ? 'required' : 'not required'}</dd></dl>
      <p>Scope records the original/resulting access requirements, not necessarily the resulting record’s setting membership.</p>
      <h3>Application rationale</h3><p className={styles.rationale}>{proposal.rationale || 'No rationale supplied.'}</p>
      <h3>Stored normalized operation</h3><Json value={proposal.operation} />
      {proposal.operation.action === 'update' ? <p>Update data is a patch: absent fields stay unchanged, objects merge, arrays replace, and explicit null replaces. There is no historical content snapshot here. The API checks the stored revision.</p> : <p>Intended status: {String(proposal.operation.data.status ?? 'draft (default)')}.</p>}
      {publicationImpact && <div className={styles.warning}><strong>{proposal.operation.action === 'create' ? 'Approval publishes this creation.' : 'This update can affect published content.'}</strong><p>{proposal.operation.action === 'update' ? `Current publication status has not been fetched. ${proposal.operation.data.status !== undefined ? `The patch requests status: ${String(proposal.operation.data.status)}. ` : 'The patch does not change status. '}Approval can authorize an edit to an already published record, even when the agent only has proposal access.` : 'A human approval can publish content even if the application has only proposal permission.'}</p></div>}
      {conflict && <div className={styles.warning} role="status"><p>The API reported a conflict and the detail was refreshed. If it is still pending, the proposal may be stale: the application must reread the content and submit a new proposal. You can reject this proposal. An existing review decision is authoritative.</p></div>}
      <ActionFeedback action={action} />
      {proposal.state === 'pending' ? <>
        <label className={styles.field}>Review note (optional)<textarea rows={3} maxLength={10000} disabled={action.pending || !!cooldown} value={note} onChange={event => { setNote(event.target.value); action.clear(); }} /></label>
        {publicationImpact && <Check label="I understand the publication impact of this approval" checked={acknowledged} disabled={action.pending || !!cooldown} onChange={value => { setAcknowledged(value); action.clear(); }} />}
        <div className={styles.actions}><Button disabled={action.pending || action.retryable || !!cooldown || query.isFetching || !!query.error || conflict || (publicationImpact && !acknowledged)} onClick={() => decide('approve')}>Approve stored operation</Button><Button tone="danger" variant="outline" disabled={action.pending || action.retryable || !!cooldown || query.isFetching || !!query.error} onClick={() => decide('reject')}>Reject proposal</Button></div>
      </> : <><h3>Recorded decision</h3><p>{proposal.state} by {proposal.reviewedBy ?? '—'} at {date(proposal.reviewedAt)}</p><p className={styles.rationale}>{proposal.reviewNote || 'No review note.'}</p>{proposal.result && <Json value={proposal.result} />}<p>This decision is immutable.</p></>}
    </div>}
  </Dialog>;
}
export default function ProposalsSection() {
  const [page, setPage] = useState(1); const [state, setState] = useState<ProposalState>('pending'); const [selected, setSelected] = useState<string | null>(null);
  const query = useMcpList('proposals', page, true, state); const cooldown = useMcpCooldown();
  return <section className={styles.section} aria-labelledby="proposals-heading"><div className={styles.sectionHeader}><div><h2 id="proposals-heading">Content proposals</h2><p>Review normalized suggestions before they enter the Tapestry library.</p></div><SelectField label="Queue / history" value={state} disabled={!!cooldown} onChange={event => { setState(event.target.value as ProposalState); setPage(1); }} options={[{ value: 'pending', label: 'Pending review' }, { value: 'applied', label: 'Applied history' }, { value: 'rejected', label: 'Rejected history' }]} /></div>
    <QueryFeedback error={query.error} retry={() => void query.refetch()} />
    <Table<Proposal> rowKey="_id" rows={query.data?.records ?? []} loading={query.isFetching} emptyTitle="No proposals on this page" emptyMessage="Choose another queue or return to the previous page." columns={[
      { key: 'operation', title: 'Proposal', render: (_, row) => <><strong>{row.operation.action} {row.operation.type}</strong><small className={styles.identifier}>{row._id}</small></> },
      { key: 'identity', title: 'Connection', render: (_, row) => <span className={styles.identifier}>Client: {row.clientId}<br />Auth: {row.ownerId}<br />Grant: {row.grantId}</span> },
      { key: 'rationale', title: 'Rationale', render: (_, row) => <span className={styles.preview}>{row.rationale}</span> },
      { key: 'status', title: 'Publication', render: (_, row) => row.operation.action === 'update' ? `${row.operation.data.status !== undefined ? `Patch: ${String(row.operation.data.status)}. ` : ''}Current status unknown; may affect published content.` : String(row.operation.data.status ?? 'draft') },
      { key: 'created', title: 'Submitted', render: (_, row) => date(row.createdAt) },
    ]} rowActions={[{ key: 'review', label: state === 'pending' ? 'Review' : 'View decision', disabled: !!cooldown, onClick: row => setSelected(row._id) }]} /><Paging page={page} count={query.data?.records.length ?? 0} busy={query.isFetching} onChange={setPage} />
    {selected && <ProposalDetail id={selected} onClose={() => setSelected(null)} />}
  </section>;
}
