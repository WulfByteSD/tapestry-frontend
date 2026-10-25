'use client';

import Link from 'next/link';
import { BiDownload } from 'react-icons/bi';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader, SelectField, Tabs, TextField, Tooltip } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { adventureApi } from './adventure.api';
import { areas, downloadBlob, errorMessage, removeEntry, writeContent } from './adventure.helpers';
import { useAdventureDraft } from './useAdventureDraft';
import type { Adventure, Area } from './adventure.types';
import StoryEditor from './StoryEditor.component';
import ResourceEditor from './ResourceEditor.component';
import EncounterEditor from './EncounterEditor.component';
import AdventureReview from './AdventureReview.component';
import AuthoringRichField from '@/features/authoring/AuthoringRichField.component';
import styles from './Adventures.module.scss';

export default function AdventureEditor({ id }: { id?: string }) {
  const { data: user } = useMe();
  const query = useQuery({ queryKey: ['adventures', 'detail', id, user?._id], queryFn: () => adventureApi.read(id!), enabled: !!id && !!user, retry: false, refetchOnWindowFocus: false });
  if (!user || (id && query.isPending)) return <Loader caption="Loading the working draft…" />;
  if (id && query.isError) return <div className={styles.workspace} data-adventure-workspace><Link href="/adventures">← Adventures</Link><h1>Draft unavailable</h1><p role="alert">{errorMessage(query.error)}</p><Button onClick={() => void query.refetch()}>Retry draft</Button></div>;
  return <EditorSession key={`${user._id}:${id ?? 'new'}`} initial={query.data} userId={user._id} />;
}

function EditorSession({ initial, userId }: { initial?: Adventure; userId: string }) {
  const draft = useAdventureDraft(initial, userId);
  const [area, setArea] = useState<Area>('basics');
  const [libraryPage, setLibraryPage] = useState(1);
  const [removal, setRemoval] = useState<{ collection: 'sections' | 'resources' | 'encounters'; id: string } | null>(null);
  const promptRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!promptRef.current) return;
    const previous = document.activeElement;
    promptRef.current.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [removal, draft.destination, draft.latest, draft.recovery]);
  const libraries = useQuery({ queryKey: ['adventures', 'libraries', userId, libraryPage], queryFn: () => adventureApi.libraries(libraryPage), enabled: !draft.record, retry: false });
  const currentLibrary = useQuery({ queryKey: ['adventures', 'library', draft.libraryResourceId], queryFn: () => adventureApi.library(draft.libraryResourceId), enabled: !!draft.libraryResourceId, retry: false });
  const { content, record, dirty, busy } = draft;
  const locked = busy || draft.blocked || !!draft.recovery || !draft.ready;
  const partProps = { content, onChange: draft.setContent, onRemove: (collection: 'sections' | 'resources' | 'encounters', id: string) => setRemoval({ collection, id }) };
  const exportDraft = () => downloadBlob(new Blob([JSON.stringify({ libraryResourceId: draft.libraryResourceId, revision: record?.revision, content: writeContent(content) }, null, 2)], { type: 'application/json' }), 'adventure-draft.json');
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!locked) void draft.save(); } };
    document.addEventListener('keydown', keydown); return () => document.removeEventListener('keydown', keydown);
  }, [draft, locked]);

  const basics = <div className={styles.basics}>
    <div className={styles.sectionHeading}><div><h2>Give the adventure a beginning</h2><p>Start with the essentials. Every other area is optional and available whenever you need it.</p></div></div>
    <div className={styles.fields}>
      <TextField id="adventure-title" label="Adventure title" required maxLength={200} placeholder="A name worth following" value={content.title} onChange={e => draft.setContent({ ...content, title: e.target.value })} />
      <AuthoringRichField id="adventure-summary" label="Summary" hint="Set the premise and tone for the Storyweaver. Up to 4,000 characters." maxLength={4000} value={content.summary} onChange={value => draft.setContent({ ...content, summary: value })} />
      <section className={styles.group}><h3>The library module behind this adventure</h3><p>One existing module entitlement covers the entire adventure. Each library module can belong to only one adventure; this relationship cannot change after creation.</p>
        {record ? <p><strong>{currentLibrary.data?.payload.title ?? 'Linked library module'}</strong>{currentLibrary.data && ` · ${currentLibrary.data.payload.status}`}</p> : libraries.isPending ? <Loader caption="Loading eligible library modules…" /> : libraries.isError ? <div role="alert"><p>{errorMessage(libraries.error)}</p><Button variant="outline" onClick={() => void libraries.refetch()}>Retry library modules</Button></div> : <>
          <SelectField id="library-module" label="Existing library module" value={draft.libraryResourceId} options={[{ value: '', label: 'Choose a library module' }, ...(!libraries.data.payload.some(r => r._id === draft.libraryResourceId) && draft.libraryResourceId ? [{ value: draft.libraryResourceId, label: currentLibrary.data?.payload.title ?? 'Selected module (another page)' }] : []), ...libraries.data.payload.filter(r => r.kind === 'module' && r.accessPolicy === 'entitlement').map(r => ({ value: r._id, label: `${r.title} · ${r.status}` }))]} onChange={e => draft.setLibraryResourceId(e.target.value)} />
          {!libraries.data.payload.length && <p>No eligible modules on this page. Create a Resource with kind “module” and access policy “entitlement” in existing Resources management.</p>}
          <div className={styles.actions}><Button variant="ghost" disabled={libraryPage === 1} onClick={() => setLibraryPage(libraryPage - 1)}>Previous modules</Button><span>Page {libraryPage}</span><Button variant="ghost" disabled={libraryPage >= (libraries.data.metadata?.pages ?? libraryPage)} onClick={() => setLibraryPage(libraryPage + 1)}>Next modules</Button></div>
        </>}
        {currentLibrary.isError && <p role="alert">The selected library resource could not be read. <Button variant="ghost" onClick={() => void currentLibrary.refetch()}>Retry resource</Button></p>}
        <Link href="/resources">Open Resources management →</Link><p className={styles.hint}>Use the existing product mechanism for paid access or free claims. No new grants are needed for included materials.</p>
      </section>
    </div>
  </div>;
  const items = [
    { key: 'basics', label: 'Basics', children: basics },
    { key: 'story', label: `Story · ${content.sections.length}`, children: <StoryEditor {...partProps} /> },
    { key: 'resources', label: `Resources · ${content.resources.length}`, children: <ResourceEditor {...partProps} record={record} dirty={dirty} locked={locked} mutate={draft.mutate} /> },
    { key: 'encounters', label: `Encounters · ${content.encounters.length}`, children: <EncounterEditor {...partProps} /> },
    { key: 'review', label: 'Review & publish', children: <AdventureReview content={content} record={record} libraryResourceId={draft.libraryResourceId} dirty={dirty} locked={locked} issues={draft.issues} onArea={setArea} mutate={draft.mutate} /> },
  ];
  return <div className={styles.workspace} data-adventure-workspace>
    <Link href="/adventures" className={styles.back}>← Adventures</Link>
    <div className={styles.saveBar}><div aria-live="polite"><strong>{busy ? 'Working…' : draft.blocked ? 'Server check required' : dirty ? 'Unsaved changes' : record ? `Saved draft · revision ${record.revision}` : 'Not saved yet'}</strong><span>Save with Ctrl / ⌘ S</span></div><div className={styles.actions}><Tooltip title="Download draft copy"><Button variant="ghost" tone="neutral" onClick={exportDraft} aria-label="Download draft copy" title="Download draft copy"><BiDownload size={22} aria-hidden /></Button></Tooltip><Button isLoading={busy} disabled={locked || (!!record && !dirty)} onClick={() => void draft.save()}>{record ? 'Save draft' : 'Create draft'}</Button></div></div>
    <header className={styles.editorHeading}><p className={styles.eyebrow}>{record ? `${record.status} · working draft` : 'New adventure'}</p><h1>{content.title || 'An adventure takes shape'}</h1><p>Move between areas freely. Changes stay in your working draft until you choose to publish.</p></header>
    {draft.error && <div className={styles.error} role="alert">{draft.error}</div>}
    {draft.notice && <p className={styles.notice} role="status">{draft.notice}</p>}
    {draft.storageError && <p className={styles.error} role="alert">This browser could not retain a recovery copy. Save or download your draft before leaving.</p>}
    {draft.recovery && <section ref={promptRef} tabIndex={-1} className={styles.confirm} aria-label="Recover unsaved draft"><h2>This tab has an unfinished draft</h2><p>Restore your previous edits, or use the freshly loaded server version.</p><div className={styles.actions}><Button onClick={draft.restore}>Restore unsaved draft</Button><Button variant="outline" onClick={draft.discardRecovery}>Use server version</Button></div></section>}
    {draft.blocked && <section className={styles.confirm}><h2>Preserve your work before continuing</h2><p>A write conflicted or its outcome could not be confirmed. Further writes are paused. Download your local draft before replacing it.</p>{record ? <Button disabled={busy} onClick={() => void draft.reload()}>Check server draft</Button> : <><p>Creation may have succeeded. Check the adventure list for the selected library module before trying another creation.</p><Link href="/adventures">Check adventure list →</Link></>}</section>}
    {draft.latest && <section ref={promptRef} tabIndex={-1} className={styles.confirm}><h3>Server revision {draft.latest.revision}: {draft.latest.title}</h3><p>Using this version replaces all local edits. Download your draft copy first if you need to reconcile them.</p><div className={styles.actions}><Button onClick={draft.useLatest}>Replace local edits with server draft</Button>{draft.latest.revision === record?.revision && <Button variant="outline" onClick={draft.resumeUnchanged}>Keep local edits; server revision unchanged</Button>}<Button variant="ghost" onClick={() => draft.setLatest(null)}>Keep local edits</Button></div></section>}
    {draft.destination && <section ref={promptRef} tabIndex={-1} className={styles.confirm} aria-label="Leave editor"><h2>{busy ? 'Wait for the current request' : 'Keep your draft before leaving'}</h2><p>{busy ? 'A save or status change is still in progress.' : draft.storageError ? 'Browser recovery is unavailable. Save or download your work first.' : 'Unsaved text is recoverable in this browser tab. Selected files must be chosen again.'}</p><div className={styles.actions}><Button disabled={locked || !dirty} onClick={() => void draft.leave(true)}>Save and leave</Button><Button variant="outline" disabled={busy || draft.storageError} onClick={() => void draft.leave(false)}>Leave with recovery copy</Button><Button variant="ghost" onClick={() => draft.setDestination(null)}>Stay in editor</Button></div></section>}
    {removal && <section ref={promptRef} tabIndex={-1} className={styles.confirm} aria-label="Remove adventure entry"><h2>Remove “{content[removal.collection].find(item => item.id === removal.id)?.title}”?</h2><p>This removes the entry and its links or section associations from the working draft. Other entries keep their IDs and content. The published snapshot stays unchanged until publication.</p><div className={styles.actions}><Button tone="danger" disabled={locked} onClick={() => { draft.setContent(removeEntry(content, removal.collection, removal.id)); setRemoval(null); }}>Remove from draft</Button><Button variant="ghost" onClick={() => setRemoval(null)}>Cancel removal</Button></div></section>}
    {draft.error && draft.issues.length > 0 && <ul className={styles.validation} aria-label="Draft validation">{draft.issues.map((issue, i) => <li key={i}><Button variant="ghost" tone="neutral" onClick={() => setArea(issue.area)}>{issue.message}</Button></li>)}</ul>}
    <fieldset disabled={busy || !!draft.recovery || !draft.ready} className={styles.editorSurface} aria-label="Adventure authoring">
      <div className={styles.mobileArea}><SelectField id="authoring-area" label="Authoring area" value={area} options={areas.map(a => ({ value: a.key, label: a.label }))} onChange={e => setArea(e.target.value as Area)} /></div>
      <Tabs items={items} activeKey={area} onChange={key => setArea(key as Area)} variant="underline" fit="content" keepMounted tabListClassName={styles.areaTabs} contentClassName={styles.editorBody} ariaLabel="Adventure authoring areas" />
    </fieldset>
    <p className={styles.footnote}>Text drafts are kept in this browser tab for recovery until saved. Browser Back preserves that copy; closing the tab may remove it. Protected files are never stored in that copy.</p>
  </div>;
}
