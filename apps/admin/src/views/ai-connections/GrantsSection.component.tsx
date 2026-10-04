'use client';
import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAuthObject, getSettings } from '@tapestry/api-client';
import { Button, Input, SelectField, Table } from '@tapestry/ui';
import { api } from '@/lib/api';
import { createGrant, revokeGrant, updateGrant } from '@/lib/mcp-admin/mcpAdmin.api';
import { useMcpAction, useMcpCooldown, useMcpList } from '@/lib/mcp-admin/mcpAdmin.hooks';
import type { Capability, Client, ContentType, CreateGrant, Grant, OwnAuth, Page, UpdateGrant } from '@/lib/mcp-admin/mcpAdmin.types';
import { ActionFeedback, Check, date, Dialog, lines, Paging, QueryFeedback } from './McpShared.component';
import styles from './AiConnections.module.scss';

const types: ContentType[] = ['items', 'skills', 'abilities', 'settings', 'lore', 'combatants'];
const capabilities: { value: Capability; hint: string }[] = [
  { value: 'read', hint: 'Required. Reads published content within this scope.' },
  { value: 'propose', hint: 'Suggestions for human review; no direct writes.' },
  { value: 'create', hint: 'Direct creation. New records default to draft.' },
  { value: 'update', hint: 'Direct updates using the record revision.' },
  { value: 'bulk', hint: 'Up to 50 operations; also needs propose or the relevant direct capabilities.' },
  { value: 'publish', hint: 'Also required for direct publishing and any direct edit to published content.' },
  { value: 'read:draft', hint: 'Read draft records within scope.' },
  { value: 'read:archived', hint: 'Read archived records; does not permit archival or editing archived records.' },
];
function localDate(value: string) { const parsed = new Date(value); if (Number.isNaN(parsed.getTime())) return ''; return new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
function grantState(grant: Grant) { return !grant.isActive ? 'Revoked' : new Date(grant.expiresAt).getTime() <= Date.now() ? 'Expired' : 'Active'; }
function toggle<T extends string>(values: T[], value: T, selected: boolean) { return selected ? [...values, value] : values.filter(entry => entry !== value); }
function loaded<T>(queryClient: ReturnType<typeof useQueryClient>, resource: string) {
  const unique = new Map<string, T>();
  for (const [, data] of queryClient.getQueriesData<Page<T & { _id: string }>>({ queryKey: ['mcp-admin', resource] })) for (const record of data?.records ?? []) unique.set(record._id, record);
  return [...unique.values()];
}
function GrantForm({ grant, initialClient, clients, grants, onClose, onSaved, onExisting }: { grant?: Grant; initialClient?: string; clients: Client[]; grants: Grant[]; onClose: () => void; onSaved: () => void; onExisting: (grant: Grant) => void }) {
  const action = useMcpAction(); const cooldown = useMcpCooldown();
  const [clientId, setClientId] = useState(grant?.clientId ?? initialClient ?? '');
  const [ownerId, setOwnerId] = useState(grant?.ownerId ?? '');
  const [owner, setOwner] = useState<OwnAuth | null>(null); const [checkingOwner, setCheckingOwner] = useState(false); const [ownerError, setOwnerError] = useState('');
  const [expiry, setExpiry] = useState(grant ? localDate(grant.expiresAt) : '');
  const [selectedCapabilities, setCapabilities] = useState<Capability[]>(grant?.capabilities ?? ['read', 'propose']);
  const [selectedTypes, setTypes] = useState<ContentType[]>(grant?.contentTypes ?? []);
  const [keys, setKeys] = useState(grant?.settingKeys.join('\n') ?? '');
  const [shared, setShared] = useState(grant?.shared ?? false); const [active, setActive] = useState(grant?.isActive ?? true);
  const settings = useQuery({ queryKey: ['admin-content', 'settings'], queryFn: async () => (await getSettings(api, { pageNumber: 1, pageLimit: 200, sortOptions: 'name' })).payload ?? [], retry: false, refetchOnWindowFocus: false });
  const verifyOwner = async () => {
    setOwner(null); setOwnerError('');
    if (!/^[a-f\d]{24}$/i.test(ownerId.trim())) { setOwnerError('Enter a 24-character Auth account ID.'); return; }
    setCheckingOwner(true);
    try {
      const data: OwnAuth = await fetchAuthObject(api, ownerId.trim());
      if (data._id !== ownerId.trim() || !data.isActive || !data.isEmailVerified) throw new Error('The owner must be an active, email-verified Auth account.');
      setOwner({ _id: data._id, email: data.email, isActive: data.isActive, isEmailVerified: data.isEmailVerified });
    } catch (failure) { setOwnerError(failure instanceof Error ? failure.message : 'Account could not be verified. Check the Auth ID and your access.'); }
    finally { setCheckingOwner(false); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (action.pending || action.retryable || checkingOwner || cooldown) return;
    try {
      if (!clientId.trim()) throw new Error('Select or enter a client ID.');
      if ((!grant || (!grant.isActive && active)) && (!owner || owner._id !== ownerId.trim())) throw new Error('Confirm the accountable Auth account before creating or reactivating access.');
      const settingKeys = lines(keys);
      if (settingKeys.length > 100 || settingKeys.some(key => key.length > 128 || key === 'shared')) throw new Error('Use up to 100 exact setting keys, each 1–128 characters. Use the shared toggle separately.');
      if (!selectedTypes.length || !selectedCapabilities.includes('read')) throw new Error('Select at least one content type and retain read access.');
      const expiresAt = expiry === (grant ? localDate(grant.expiresAt) : '') && grant ? grant.expiresAt : new Date(expiry).toISOString();
      if ((!grant || expiresAt !== grant.expiresAt || (!grant.isActive && active)) && new Date(expiresAt).getTime() <= Date.now()) throw new Error('Choose a future expiry in your local time.');
      if (!grant) {
        const machine = clients.find(client => client.clientId === clientId.trim())?.kind === 'machine';
        const existing = grants.find(entry => entry.clientId === clientId.trim() && (machine || entry.ownerId === ownerId.trim()));
        if (existing) { action.validation('This grant already exists, including expired or revoked grants. Open it to edit/reactivate.'); return; }
        const body: CreateGrant = { operationId: crypto.randomUUID(), clientId: clientId.trim(), ownerId: ownerId.trim(), capabilities: [...selectedCapabilities], contentTypes: [...selectedTypes], settingKeys, shared, expiresAt };
        void action.run(() => createGrant(body), onSaved);
      } else {
        const body: UpdateGrant = { operationId: crypto.randomUUID() };
        if (JSON.stringify(selectedCapabilities) !== JSON.stringify(grant.capabilities)) body.capabilities = [...selectedCapabilities];
        if (JSON.stringify(selectedTypes) !== JSON.stringify(grant.contentTypes)) body.contentTypes = [...selectedTypes];
        if (JSON.stringify(settingKeys) !== JSON.stringify(grant.settingKeys)) body.settingKeys = settingKeys;
        if (shared !== grant.shared) body.shared = shared;
        if (expiresAt !== grant.expiresAt) body.expiresAt = expiresAt;
        if (active !== grant.isActive) body.isActive = active;
        if (Object.keys(body).length === 1) throw new Error('Change at least one field before saving.');
        void action.run(() => updateGrant(grant._id, body), onSaved);
      }
    } catch (failure) { action.validation(failure instanceof Error ? failure.message : 'Check the grant values.'); }
  };
  const existing = !grant ? grants.find(entry => entry.clientId === clientId.trim() && (clients.find(client => client.clientId === clientId.trim())?.kind === 'machine' || entry.ownerId === ownerId.trim())) : undefined;
  return <Dialog title={grant ? 'Edit scoped access grant' : 'Create scoped access grant'} onClose={onClose} busy={action.pending || checkingOwner}><form onSubmit={submit} onChange={() => action.clear()} className={styles.form}><fieldset disabled={action.pending || checkingOwner || !!cooldown}>
    <Input label="OAuth client ID" value={clientId} required disabled={!!grant} list="mcp-loaded-clients" onChange={event => setClientId(event.target.value)} hint="External clientId, not the client’s Mongo record ID. Suggestions contain loaded pages only." /><datalist id="mcp-loaded-clients">{clients.map(client => <option key={client.clientId} value={client.clientId}>{client.name}</option>)}</datalist>
    <Input label="Accountable owner — Auth account ID" value={ownerId} required disabled={!!grant} onChange={event => { setOwnerId(event.target.value); setOwner(null); setOwnerError(''); }} hint="24-character Auth ID. A player/Admin profile ID or email cannot be used. Client and owner are fixed after creation." />
    <Button type="button" variant="outline" tone="neutral" onClick={() => void verifyOwner()}>Confirm Auth account</Button>
    {owner && <p role="status">Confirmed: {owner.email ?? owner._id} · active and email verified</p>}{ownerError && <p role="alert">{ownerError}</p>}
    <Input label="Expires at (your local time)" type="datetime-local" required value={expiry} onChange={event => setExpiry(event.target.value)} hint="Converted to a fixed UTC timestamp at submission, preserved for retries." />
    <fieldset><legend>Allowed content types — choose deliberately</legend><div className={styles.choices}>{types.map(value => <Check key={value} label={value} checked={selectedTypes.includes(value)} onChange={selected => setTypes(toggle(selectedTypes, value, selected))} />)}</div></fieldset>
    <SelectField label="Add an existing setting key" value="" onChange={event => { if (event.target.value) setKeys([...new Set([...lines(keys), event.target.value])].join('\n')); }} options={[{ value: '', label: 'Choose a setting to add' }, ...(settings.data ?? []).map(setting => ({ value: setting.key, label: `${setting.name} (${setting.key})` }))]} />
    {settings.error && <p>Setting suggestions could not be loaded. Enter exact keys below.</p>}
    <label className={styles.field}>Allowed setting keys (one per line)<textarea rows={3} value={keys} onChange={event => setKeys(event.target.value)} /><small>Domain keys, including future setting keys. Referenced settings must exist before another record uses them. Empty keys with shared disabled grants no setting access.</small></label>
    <Check label="Allow shared content" checked={shared} onChange={setShared} hint="Required for records with empty setting membership or the shared marker. Every attached setting must still be allowed." />
    <fieldset><legend>Capabilities</legend><div className={styles.capabilities}>{capabilities.map(({ value, hint }) => <Check key={value} label={value} hint={hint} checked={selectedCapabilities.includes(value)} disabled={value === 'read'} onChange={selected => setCapabilities(toggle(selectedCapabilities, value, selected))} />)}</div></fieldset>
    <p className={styles.warning}>Referenced types and settings must also be readable. Items that grant abilities need readable abilities. This form never expands scope automatically.</p>
    {grant && <Check label="Grant is active" checked={active} onChange={setActive} hint="Disabling stops current tokens and blocks approval of pending proposals. Reactivation requires a future expiry; old revoked tokens are not revived." />}
    <p>Expanding capabilities requires a new agent token. Type and setting restrictions are checked on every request. Active state is not a connection health check.</p>
    {existing && <div className={styles.warning}><p>A loaded grant already exists ({grantState(existing)}).</p><Button type="button" variant="outline" tone="neutral" onClick={() => onExisting(existing)}>Edit existing grant</Button></div>}
    <div className={styles.actions}><Button type="submit" disabled={action.retryable || ((!grant || (!grant.isActive && active)) && !owner) || !!existing} isLoading={action.pending}>{grant ? 'Save grant changes' : 'Create grant'}</Button><Button type="button" tone="neutral" variant="ghost" onClick={onClose}>Cancel</Button></div>
  </fieldset><ActionFeedback action={action} /></form></Dialog>;
}
export default function GrantsSection({ initialClient }: { initialClient?: string }) {
  const queryClient = useQueryClient(); const [page, setPage] = useState(1); const [clientPage, setClientPage] = useState(1);
  const query = useMcpList('grants', page, true); const clientsQuery = useMcpList('clients', clientPage, true);
  const action = useMcpAction(); const cooldown = useMcpCooldown();
  const [editing, setEditing] = useState<Grant | 'new' | null>(initialClient ? 'new' : null); const [revoking, setRevoking] = useState<Grant | null>(null);
  const clients = loaded<Client>(queryClient, 'clients'); const grants = loaded<Grant>(queryClient, 'grants');
  return <section className={styles.section} aria-labelledby="grants-heading"><div className={styles.sectionHeader}><div><h2 id="grants-heading">Scoped access grants</h2><p>Assign an accountable owner and the least content access the application needs.</p></div><Button disabled={action.pending || !!cooldown} onClick={() => setEditing('new')}>Create access grant</Button></div>
    <p>One grant per machine client, or per interactive client/account pair. Expired and revoked grants still occupy that identity: edit/reactivate them.</p>
    <QueryFeedback error={query.error} retry={() => void query.refetch()} /><ActionFeedback action={action} />
    <Table<Grant> rowKey="_id" rows={query.data?.records ?? []} loading={query.isFetching} emptyTitle="No grants on this page" columns={[
      { key: 'client', title: 'Client / owner', render: (_, row) => <><strong>{clients.find(client => client.clientId === row.clientId)?.name ?? row.clientId}</strong><small className={styles.identifier}>Client: {row.clientId}<br />Auth: {row.ownerId}<br />Grant: {row._id}</small></> },
      { key: 'scope', title: 'Scope', render: (_, row) => <>{row.contentTypes.join(', ')}<small className={styles.identifier}>{row.settingKeys.join(', ') || 'No setting keys'}{row.shared ? ' · shared allowed' : ''}</small><small className={styles.identifier}>{row.capabilities.join(', ')}</small></> },
      { key: 'state', title: 'State', render: (_, row) => grantState(row) },
      { key: 'expiry', title: 'Expiry', render: (_, row) => date(row.expiresAt) },
    ]} rowActions={[
      { key: 'edit', label: 'Edit / reactivate', disabled: action.pending || !!cooldown, onClick: row => setEditing(row) },
      { key: 'revoke', label: 'Revoke', tone: 'danger', disabled: row => !row.isActive || action.pending || !!cooldown, onClick: row => { action.clear(); setRevoking(row); } },
    ]} /><Paging page={page} count={query.data?.records.length ?? 0} busy={query.isFetching} onChange={setPage} />
    <details className={styles.details}><summary>Load more application choices</summary><p>{clients.length} application records loaded across visited pages. Exact client ID entry remains available.</p><QueryFeedback error={clientsQuery.error} retry={() => void clientsQuery.refetch()} /><Paging page={clientPage} count={clientsQuery.data?.records.length ?? 0} busy={clientsQuery.isFetching} onChange={setClientPage} /></details>
    {editing && <GrantForm key={editing === 'new' ? 'new' : editing._id} grant={editing === 'new' ? undefined : editing} initialClient={initialClient} clients={clients} grants={grants} onClose={() => setEditing(null)} onSaved={() => setEditing(null)} onExisting={setEditing} />}
    {revoking && <Dialog title="Revoke access grant" busy={action.pending} onClose={() => { setRevoking(null); action.clear(); }}><p>Revoke grant <code>{revoking._id}</code> for <code>{revoking.clientId}</code>?</p><p>This stops current tokens and blocks approval of pending proposals from this grant.</p><ActionFeedback action={action} /><div className={styles.actions}><Button tone="danger" disabled={!!cooldown || action.retryable} isLoading={action.pending} onClick={() => { const operationId = crypto.randomUUID(); const grantId = revoking._id; void action.run(() => revokeGrant(grantId, operationId), () => setRevoking(null)); }}>Revoke grant</Button><Button variant="ghost" tone="neutral" disabled={action.pending} onClick={() => { setRevoking(null); action.clear(); }}>Cancel</Button></div></Dialog>}
  </section>;
}
