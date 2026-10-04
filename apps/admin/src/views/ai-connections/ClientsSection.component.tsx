'use client';
import { useState, type FormEvent } from 'react';
import { Button, Input, SelectField, Table } from '@tapestry/ui';
import { registerClient, rotateClient, updateClient } from '@/lib/mcp-admin/mcpAdmin.api';
import { useMcpAction, useMcpCooldown, useMcpList } from '@/lib/mcp-admin/mcpAdmin.hooks';
import type { Client, RegisterClient, UpdateClient } from '@/lib/mcp-admin/mcpAdmin.types';
import { ActionFeedback, Check, date, Dialog, lines, Paging, QueryFeedback, validateCallbacks } from './McpShared.component';
import styles from './AiConnections.module.scss';

function ClientForm({ client, onClose, onSaved }: { client?: Client; onClose: () => void; onSaved: (client: Client, secret?: string) => void }) {
  const action = useMcpAction(); const cooldown = useMcpCooldown();
  const [name, setName] = useState(client?.name ?? '');
  const [clientId, setClientId] = useState('');
  const [kind, setKind] = useState<Client['kind']>(client?.kind ?? 'interactive');
  const [confidential, setConfidential] = useState(client?.confidential ?? false);
  const [callbacks, setCallbacks] = useState(client?.redirectUris.join('\n') ?? '');
  const [acknowledged, setAcknowledged] = useState(false);
  const redirectUris = kind === 'machine' ? [] : lines(callbacks);
  const callbackChanged = !!client && JSON.stringify(redirectUris) !== JSON.stringify(client.redirectUris);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (action.pending || action.retryable || cooldown) return;
    try {
      if (!name.trim() || name.trim().length > 100) throw new Error('Enter a name with 1–100 characters.');
      if (kind === 'interactive') validateCallbacks(redirectUris);
      if (callbackChanged && !acknowledged) throw new Error('Confirm the callback revocation warning.');
      if (client) {
        const body: UpdateClient = { operationId: crypto.randomUUID(), ...(name.trim() !== client.name ? { name: name.trim() } : {}), ...(callbackChanged ? { redirectUris } : {}) };
        if (Object.keys(body).length === 1) throw new Error('Change the name or callbacks before saving.');
        void action.run(() => updateClient(client.clientId, body), result => onSaved(result));
      } else {
        const body: RegisterClient = { operationId: crypto.randomUUID(), ...(clientId.trim() ? { clientId: clientId.trim() } : {}), name: name.trim(), kind, confidential: kind === 'machine' || confidential, redirectUris };
        void action.run(() => registerClient(body), result => { const { clientSecret, ...metadata } = result; onSaved(metadata, clientSecret); });
      }
    } catch (error) { action.validation(error instanceof Error ? error.message : 'Check the form values.'); }
  };
  return <Dialog title={client ? `Edit ${client.name}` : 'Register an AI application'} onClose={onClose} busy={action.pending}><form onSubmit={submit} onChange={() => action.clear()} className={styles.form}>
    <fieldset disabled={action.pending || !!cooldown}>
      <Input label="Application name" value={name} required maxLength={100} onChange={event => setName(event.target.value)} />
      {client ? <p>Client ID: <code>{client.clientId}</code> · {client.kind} · {client.confidential ? 'confidential' : 'public'} (fixed at registration)</p> : <>
        <Input label="Client ID (optional)" hint="Leave empty for an API-generated OAuth identifier." value={clientId} maxLength={128} onChange={event => setClientId(event.target.value)} />
        <SelectField label="Application type" value={kind} onChange={event => { setKind(event.target.value as Client['kind']); setAcknowledged(false); }} options={[{ value: 'interactive', label: 'Interactive — human sign-in and consent' }, { value: 'machine', label: 'Machine — server application' }]} />
        {kind === 'interactive' && <Check label="Confidential server application" checked={confidential} onChange={setConfidential} hint="Public is preferred for desktop and browser apps, which cannot keep a secret." />}
      </>}
      {kind === 'interactive' ? <label className={styles.field}>Exact callback URLs (one per line)<textarea value={callbacks} required rows={4} onChange={event => { setCallbacks(event.target.value); setAcknowledged(false); }} /><small>1–10 HTTPS or HTTP loopback URLs. Paths, ports, and query strings match exactly; no credentials, fragments, or wildcards.</small></label> : <p>Machine clients are confidential and have no callbacks.</p>}
      {callbackChanged && <Check label="I understand this revokes existing authorizations and tokens" checked={acknowledged} onChange={setAcknowledged} hint="The application must authenticate again after callback changes." />}
      <div className={styles.actions}><Button type="submit" disabled={action.retryable} isLoading={action.pending}>{client ? 'Save changes' : 'Register application'}</Button><Button type="button" tone="neutral" variant="ghost" onClick={onClose}>Cancel</Button></div>
    </fieldset><ActionFeedback action={action} />
  </form></Dialog>;
}
export default function ClientsSection({ onGrant }: { onGrant: (clientId: string) => void }) {
  const [page, setPage] = useState(1); const query = useMcpList('clients', page, true); const action = useMcpAction(); const cooldown = useMcpCooldown();
  const [editing, setEditing] = useState<Client | 'new' | null>(null);
  const [confirmation, setConfirmation] = useState<{ client: Client; kind: 'active' | 'rotate' } | null>(null);
  const [registered, setRegistered] = useState<Client | null>(null);
  const [secret, setSecret] = useState<{ clientId: string; value: string } | null>(null);
  const [secretMessage, setSecretMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const handleSecret = (clientId: string, value?: string) => { setCopyMessage(''); if (value) { setSecret({ clientId, value }); setSecretMessage(''); } else { setSecretMessage(`The secret for ${clientId} cannot be recovered from a replay. Start a new rotation to receive a new one-time secret.`); } };
  const confirm = () => {
    if (!confirmation) return;
    const { client, kind } = confirmation; const operationId = crypto.randomUUID();
    if (kind === 'rotate') void action.run(() => rotateClient(client.clientId, operationId), result => { setConfirmation(null); handleSecret(result.clientId, result.clientSecret); });
    else void action.run(() => updateClient(client.clientId, { operationId, isActive: !client.isActive }), () => setConfirmation(null));
  };
  return <section className={styles.section} aria-labelledby="clients-heading"><div className={styles.sectionHeader}><div><h2 id="clients-heading">AI applications</h2><p>Preregister an application, then create a separate scoped access grant.</p></div><Button onClick={() => setEditing('new')} disabled={action.pending || !!cooldown}>Register application</Button></div>
    {registered && <div className={styles.notice}><p><strong>{registered.name} is registered.</strong> Registration alone grants no content access.</p><div className={styles.actions}><Button disabled={!!secret} onClick={() => onGrant(registered.clientId)}>Create access grant</Button>{registered.confidential && !!secretMessage && <Button variant="outline" tone="neutral" disabled={action.pending || !!cooldown} onClick={() => { action.clear(); setConfirmation({ client: registered, kind: 'rotate' }); }}>Start a fresh secret rotation</Button>}</div></div>}
    {secretMessage && <div role="status" className={styles.warning}><p>{secretMessage}</p><p>Use Rotate secret on the application below. A fresh rotation stops existing tokens.</p></div>}
    <QueryFeedback error={query.error} retry={() => void query.refetch()} /><ActionFeedback action={action} />
    <Table<Client> rowKey="clientId" rows={query.data?.records ?? []} loading={query.isFetching} emptyTitle="No applications on this page" emptyMessage="Register an application or return to the previous page." columns={[
      { key: 'name', title: 'Application', render: (_, row) => <><strong>{row.name}</strong><small className={styles.identifier}>{row.clientId}</small></> },
      { key: 'type', title: 'Type', render: (_, row) => `${row.kind} · ${row.confidential ? 'confidential' : 'public'}` },
      { key: 'active', title: 'State', render: (_, row) => row.isActive ? 'Active' : 'Disabled' },
      { key: 'created', title: 'Registered', render: (_, row) => date(row.createdAt) },
    ]} rowActions={[
      { key: 'edit', label: 'Edit', disabled: action.pending || !!cooldown, onClick: row => { action.clear(); setEditing(row); } },
      { key: 'active', label: 'Enable / disable', disabled: action.pending || !!cooldown, onClick: row => { action.clear(); setConfirmation({ client: row, kind: 'active' }); } },
      { key: 'rotate', label: 'Rotate secret', disabled: row => !row.confidential || action.pending || !!cooldown, onClick: row => { action.clear(); setConfirmation({ client: row, kind: 'rotate' }); } },
      { key: 'grant', label: 'Create grant', disabled: action.pending || !!cooldown, onClick: row => onGrant(row.clientId) },
    ]} /><Paging page={page} count={query.data?.records.length ?? 0} busy={query.isFetching} onChange={setPage} />
    {editing && <ClientForm client={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} onSaved={(client, value) => { const isNew = editing === 'new'; setEditing(null); if (isNew) { setRegistered(client); if (client.confidential) handleSecret(client.clientId, value); } }} />}
    {confirmation && <Dialog title={confirmation.kind === 'rotate' ? 'Rotate confidential secret' : confirmation.client.isActive ? 'Disable application' : 'Enable application'} onClose={() => { setConfirmation(null); action.clear(); }} busy={action.pending}>
      <p><strong>{confirmation.client.name}</strong> · <code>{confirmation.client.clientId}</code></p><p>{confirmation.kind === 'rotate' ? 'The previous secret and existing tokens will stop working. Save the new secret securely and authenticate again.' : confirmation.client.isActive ? 'Existing tokens will stop working. The application will be unable to connect.' : 'Revoked tokens are not restored. The application must authenticate again.'}</p>
      <ActionFeedback action={action} /><div className={styles.actions}><Button disabled={!!cooldown || action.retryable} isLoading={action.pending} onClick={confirm}>Confirm {confirmation.kind === 'rotate' ? 'rotation' : confirmation.client.isActive ? 'disable' : 'enable'}</Button><Button variant="ghost" tone="neutral" disabled={action.pending} onClick={() => { setConfirmation(null); action.clear(); }}>Cancel</Button></div>
    </Dialog>}
    {secret && <Dialog title="Save your one-time client secret" onClose={() => setSecret(null)}><p>Client ID: <code>{secret.clientId}</code></p><p>This secret is displayed once. Store it in your server’s secret manager.</p><pre className={styles.secret}>{secret.value}</pre><p role="status">{copyMessage}</p><div className={styles.actions}><Button onClick={() => { void navigator.clipboard.writeText(secret.value).then(() => setCopyMessage('Copied. Store it securely.'), () => setCopyMessage('Copy failed. Select the secret and copy it manually.')); }}>Copy secret</Button><Button variant="outline" tone="neutral" onClick={() => setSecret(null)}>Saved securely — dismiss</Button></div><p>Closing this panel clears the displayed secret. It cannot be revealed again.</p></Dialog>}
  </section>;
}
