'use client';
import { useState } from 'react';
import { Button, Input, Loader } from '@tapestry/ui';
import { mcpEndpoint } from '@/lib/mcp-admin/mcpAdmin.api';
import { useMcpBusy, useMcpCooldown, useMcpPermissions } from '@/lib/mcp-admin/mcpAdmin.hooks';
import ClientsSection from './ClientsSection.component';
import GrantsSection from './GrantsSection.component';
import ProposalsSection from './ProposalsSection.component';
import AuditSection from './AuditSection.component';
import styles from './AiConnections.module.scss';

type Section = 'clients' | 'grants' | 'proposals' | 'audit' | 'instructions';
function Instructions() {
  const [copyStatus, setCopyStatus] = useState('');
  return <section className={styles.section} aria-labelledby="instructions-heading"><h2 id="instructions-heading">Connect a registered application</h2><p>Register the application and create a scoped grant before connecting. Anonymous access and automatic public registration are not supported.</p><Input label="MCP endpoint" value={mcpEndpoint} readOnly /><div className={styles.actions}><Button variant="outline" tone="neutral" onClick={() => { void navigator.clipboard.writeText(mcpEndpoint).then(() => setCopyStatus('Endpoint copied.'), () => setCopyStatus('Copy failed. Select the endpoint and copy it manually.')); }}>Copy endpoint</Button><span role="status">{copyStatus}</span></div><h3>Interactive applications</h3><p>Start the API’s S256 PKCE sign-in and consent flow with the exact registered callback. Browser and desktop applications should use a public client; server applications may use confidential clients.</p><h3>Machine applications</h3><p>Use the confidential client ID and secret on the application’s server to obtain a short-lived token from <code>{mcpEndpoint}/oauth/token</code>. Store the secret in a server secret manager.</p><p>The admin browser does not exchange or test client secrets. Keep the human app session separate from agent tokens.</p><p><a href="https://github.com/CNFishead/tapestry-api/blob/dev/src/modules/game/content/mcp/docs/content-mcp.md" target="_blank" rel="noopener noreferrer">Read the operator guide for exact OAuth exchange fields and deployment configuration</a></p><p>The API must enable MCP and allow this admin website’s exact HTTPS origin in <code>CONTENT_MCP_ORIGINS</code>. No confidential secret belongs in frontend build variables.</p></section>;
}
export default function AiConnectionsView() {
  const permissions = useMcpPermissions(); const cooldown = useMcpCooldown(); const busy = useMcpBusy(); const [section, setSection] = useState<Section | null>(null); const [grantClient, setGrantClient] = useState<string | undefined>();
  const current = section ?? (permissions.manage ? 'clients' : 'proposals');
  const choices: { key: Section; label: string }[] = [...(permissions.manage ? [{ key: 'clients' as const, label: 'Applications' }, { key: 'grants' as const, label: 'Access grants' }] : []), ...(permissions.review ? [{ key: 'proposals' as const, label: 'Proposals' }] : []), ...(permissions.manage ? [{ key: 'audit' as const, label: 'Audit' }] : []), { key: 'instructions', label: 'Connection instructions' }];
  return <div className={styles.page}><header className={styles.header}><p className={styles.eyebrow}>Storyweaver oversight</p><h1>AI connections</h1><p>Give AI applications a deliberate scope and keep human review at the heart of the library.</p></header>
    {permissions.loading ? <Loader caption="Checking your account permissions…" /> : <>
      {permissions.error && <div role="alert" className={styles.warning}><p>{permissions.error.message}</p><Button variant="outline" tone="neutral" onClick={permissions.retry}>Retry account permissions</Button></div>}
      {!permissions.manage && !permissions.review ? <div className={styles.notice}><h2>AI connection access is required</h2><p>{permissions.account.data && (!permissions.account.data.isActive || !permissions.account.data.isEmailVerified) ? 'Your Auth account must be active and email verified.' : 'Your account needs mcp:manage for applications, grants and audit, or mcp:review for proposals. Auth administrators and Admin administrators/developers have both permissions.'}</p></div> : <>
        {!!cooldown && <p className={styles.warning} role="status">The API requested a pause. Requests resume in {cooldown} seconds.</p>}
        <nav className={styles.tabs} aria-label="AI connection sections">{choices.map(choice => <Button key={choice.key} disabled={busy} variant={current === choice.key ? 'solid' : 'ghost'} tone={current === choice.key ? 'gold' : 'neutral'} aria-current={current === choice.key ? 'page' : undefined} onClick={() => { if (busy) return; setSection(choice.key); if (choice.key !== 'grants') setGrantClient(undefined); }}>{choice.label}</Button>)}</nav>
        {current === 'clients' && permissions.manage && <ClientsSection onGrant={clientId => { if (busy) return; setGrantClient(clientId); setSection('grants'); }} />}
        {current === 'grants' && permissions.manage && <GrantsSection initialClient={grantClient} />}
        {current === 'proposals' && permissions.review && <ProposalsSection />}
        {current === 'audit' && permissions.manage && <AuditSection />}
        {current === 'instructions' && <Instructions />}
      </>}
    </>}
  </div>;
}
