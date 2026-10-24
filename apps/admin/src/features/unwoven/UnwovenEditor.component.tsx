'use client';
import Link from 'next/link';
import { BiDownload } from 'react-icons/bi';
import { AuthoringProse } from '@/features/authoring/AuthoringRichField.component';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader, SelectField, Tabs, Tooltip } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { unwovenApi } from './unwoven.api';
import { areas, errorMessage } from './unwoven.helpers';
import { useUnwovenDraft } from './unwoven.hooks';
import { BattleForm, IdentityForm } from './UnwovenDetails.form';
import UnwovenMoves from './UnwovenMoves.form';
import UnwovenLore from './UnwovenLore.form';
import UnwovenConfirm from './UnwovenConfirm.modal';
import type { Area, EditorProps, SessionProps } from './unwoven.types';
import styles from './Unwoven.module.scss';

export default function UnwovenEditor({ id }: EditorProps) {
  const { data: user } = useMe();
  const query = useQuery({ queryKey: ['unwoven', 'detail', id, user?._id], queryFn: () => unwovenApi.read(id!), enabled: !!id && !!user, retry: false, refetchOnWindowFocus: false });
  if (!user || (id && query.isPending)) return <Loader caption="Loading Unwoven." />;
  if (id && query.isError) return <div className={styles.workspace} data-unwoven-workspace><Link href="/unwoven">Back to Unwoven</Link><h1>Entry unavailable</h1><p role="alert">{errorMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Retry</Button></div>;
  return <EditorSession key={`${user._id}:${id ?? 'new'}`} initial={query.data} userId={user._id} />;
}
function EditorSession({ initial, userId }: SessionProps) {
  const state = useUnwovenDraft(initial, userId);
  const [area, setArea] = useState<Area>('identity'), [removing, setRemoving] = useState(false), [publishing, setPublishing] = useState(false);
  const { draft, record, busy, dirty } = state;
  const locked = busy || state.blocked || !!state.recovery || !state.ready;
  const props = { draft, onChange: state.setDraft, issues: state.attempted ? state.issues : [], disabled: locked };
  const save = async () => { if (state.issues.length) setArea(state.issues[0].area); await state.save(); };
  const requestSave = () => { if (!state.issues.length && draft.status === 'published' && record?.status !== 'published') setPublishing(true); else void save(); };
  const review = <section className={styles.fields}><div className={styles.sectionHeading}><h2>Ready for the catalog</h2><p>Check the essentials, then choose how this entry should be available.</p></div>
    <div className={styles.preview}><p className={styles.eyebrow}>{[draft.category, draft.tier, draft.role].filter(Boolean).join(' · ')}</p><h2>{draft.name || 'Unnamed Unwoven'}</h2><dl className={styles.statSummary}>{[['HP', draft.statline.hp], ['Defense TN', draft.statline.defenseTN], ['Harm', draft.statline.harm || draft.attacks[0]?.harm || ''], ['Armor', draft.statline.armor], ['Actions', draft.statline.actions], ['Move', draft.statline.move]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value === '' ? '—' : value}</dd></div>)}</dl>
      <p>{draft.attacks.length} {draft.attacks.length === 1 ? 'attack' : 'attacks'} · {draft.abilities.length} {draft.abilities.length === 1 ? 'ability' : 'abilities'}</p>{draft.attacks.map((a, i) => <div key={`a${i}`}><strong>{a.name || 'Unnamed attack'}</strong> — {a.harm} {a.range && `· ${a.range}`}<AuthoringProse value={a.notes} /></div>)}{draft.abilities.map((a, i) => <div key={`b${i}`}><strong>{a.name || 'Unnamed ability'}</strong>{a.cooldown && ` · ${a.cooldown}`}<AuthoringProse value={a.text} /></div>)}</div>
    <SelectField id="status" label="Catalog status" value={draft.status} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]} onChange={e => state.setDraft({ ...draft, status: e.target.value as typeof draft.status })} />
    <p>Drafts can be prepared for adventures. Published entries can be used when publishing an adventure. Archived entries stay editable here and are omitted from adventure recommendations; restore one by changing its status and saving.</p>
    {state.issues.length > 0 ? <div><h3>Still to complete</h3><ul className={styles.issues}>{state.issues.map(issue => <li key={issue.field}><Button type="button" variant="ghost" onClick={() => setArea(issue.area)}>{issue.message}</Button></li>)}</ul></div> : <p role="status">The required fields are complete.</p>}
    {record && <section className={styles.divider}><h3>Remove this Unwoven</h3><p>Archive for a recoverable change, or permanently remove the entry. Adventure references do not block removal.</p><Button type="button" tone="danger" variant="outline" disabled={locked} onClick={() => setRemoving(true)}>Remove Unwoven</Button></section>}
  </section>;
  const bodies = { identity: <IdentityForm {...props} />, battle: <BattleForm {...props} />, moves: <UnwovenMoves {...props} />, lore: <UnwovenLore {...props} />, review };
  return <div className={styles.workspace} data-unwoven-workspace>
    <Link className={styles.back} href="/unwoven">← Unwoven catalog</Link>
    <div className={styles.saveBar}><div role="status"><strong>{busy ? 'Working…' : state.blocked ? 'Check the save outcome' : dirty ? 'Unsaved changes' : record ? 'All changes saved' : 'Not saved yet'}</strong><small>{record ? 'Edits apply to this catalog entry when saved.' : 'New entries begin as drafts.'}</small></div><div className={styles.actions}><Tooltip title="Download draft copy"><Button variant="ghost" aria-label="Download draft copy" title="Download draft copy" onClick={state.download}><BiDownload size={22} aria-hidden /></Button></Tooltip><Link href="/unwoven">Cancel</Link><Button disabled={locked || (!!record && !dirty)} isLoading={busy} onClick={requestSave}>{record ? 'Save changes' : 'Create Unwoven'}</Button></div></div>
    <header className={styles.heading}><p className={styles.eyebrow}>{record ? `${record.status} · Unwoven editor` : 'Build an Unwoven'}</p><h1>{draft.name || 'An Unwoven takes shape'}</h1><p>Build its identity, give it a stat block, and add the details that bring it to the table.</p></header>
    {state.error && <div className={styles.error} role="alert">{state.error}</div>}{state.notice && <p className={styles.notice} role="status">{state.notice}</p>}
    {state.storageError && <p className={styles.error} role="alert">Browser recovery is unavailable. Save or download your draft before leaving.</p>}
    {state.recovery && <section className={styles.notice}><h2>Recover an unfinished draft</h2><p>This tab kept your previous edits. Restore them or start with the server version.</p><div className={styles.actions}><Button onClick={state.restore}>Restore draft</Button><Button variant="outline" onClick={state.discardRecovery}>Use server version</Button></div></section>}
    {state.blocked && <section className={styles.notice}><h2>The request outcome needs checking</h2><p>Download your draft before continuing. {record ? 'Compare the saved entry before retrying.' : 'Creation may have succeeded. Check the catalog for this key before creating another entry.'}</p><div className={styles.actions}><Button variant="outline" onClick={state.download}>Download draft</Button>{record ? <Button disabled={busy} onClick={() => void state.checkServer()}>Check server entry</Button> : <Link href="/unwoven">Check catalog</Link>}</div></section>}
    {state.latest && <section className={styles.notice}><h2>Server entry: {state.latest.name}</h2><p>{state.canResume ? 'The saved fields are unchanged. You can keep your local edits and retry.' : 'The server entry differs from your starting version. Download your local edits before using it.'}</p><div className={styles.actions}><Button onClick={state.useLatest}>Use server version</Button>{state.canResume && <Button variant="outline" onClick={state.resume}>Keep local edits</Button>}</div></section>}
    <fieldset disabled={locked} className={styles.surface} aria-label="Unwoven authoring"><div className={styles.mobileArea}><SelectField id="authoring-area" label="Authoring area" value={area} options={areas.map(a => ({ value: a.key, label: a.label }))} onChange={e => setArea(e.target.value as Area)} /></div><Tabs items={areas.map(a => ({ ...a, children: bodies[a.key] }))} activeKey={area} onChange={key => setArea(key as Area)} variant="underline" keepMounted tabListClassName={styles.tabs} contentClassName={styles.body} ariaLabel="Unwoven authoring areas" /></fieldset>
    <p className={styles.footnote}>Unsaved edits stay in this browser tab for recovery after Back or navigation. Closing the tab may remove them.</p>
    {state.destination && <UnwovenConfirm title={busy ? 'A request is still in progress' : 'Discard unsaved work?'} confirm="Discard and leave" busy={busy} danger onCancel={() => state.setDestination(null)} onConfirm={state.leave}><p>{busy ? 'Wait for the request to finish before leaving.' : 'Leaving here discards the local draft. Save it or download a copy if you need it.'}</p></UnwovenConfirm>}
    {publishing && <UnwovenConfirm title="Publish this Unwoven?" confirm="Save as published" busy={busy} onCancel={() => setPublishing(false)} onConfirm={() => void save().then(() => setPublishing(false))}><p>This saves the entry as published and makes it eligible for published adventure recommendations.</p></UnwovenConfirm>}
    {removing && <UnwovenConfirm title={`Remove ${record?.name}?`} confirm="Permanently remove" busy={busy} disabled={state.blocked} danger onCancel={() => setRemoving(false)} onConfirm={() => void state.remove().then(ok => { if (ok) setRemoving(false); })}><p>This permanently deletes this catalog entry and discards local edits. It cannot be restored here.</p><p>Adventures keep their sections, resources, and stored references. Missing Unwoven are silently omitted when those adventures supply an encounter. Lore links keep their saved labels and IDs; clear those in the lore editor if needed.</p><p>To keep a recoverable entry, cancel and choose Archived in Catalog status instead.</p>{state.error && <p role="alert">{state.error}</p>}{state.blocked && <p>Close this dialog and check the server entry before trying again.</p>}</UnwovenConfirm>}
  </div>;
}
