'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Button, Loader } from '@tapestry/ui';
import { adventureApi } from './adventure.api';
import type { Adventure, AdventureContent, Area, Issue } from './adventure.types';
import { kinds } from './adventure.helpers';
import { AuthoringProse } from '@/features/authoring/AuthoringRichField.component';
import styles from './Adventures.module.scss';

interface Props {
  content: AdventureContent; record?: Adventure; libraryResourceId: string; dirty: boolean; locked: boolean;
  issues: Issue[]; onArea: (area: Area) => void;
  mutate: (operation: () => Promise<Adventure | void>, message: string) => Promise<boolean>;
}
export default function AdventureReview({ content, record, libraryResourceId, dirty, locked, issues, onArea, mutate }: Props) {
  const [confirm, setConfirm] = useState<'published' | 'archived' | 'delete' | null>(null);
  const confirmRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!confirm || !confirmRef.current) return;
    const previous = document.activeElement;
    confirmRef.current.focus();
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus(); };
  }, [confirm]);
  const library = useQuery({ queryKey: ['adventures', 'library', libraryResourceId], queryFn: () => adventureApi.library(libraryResourceId), enabled: !!libraryResourceId, retry: false, refetchOnMount: 'always' });
  const ids = [...new Set(content.encounters.flatMap(e => e.combatants.map(c => c.combatantId)))];
  const combatants = useQueries({ queries: ids.map(id => ({ queryKey: ['adventures', 'combatant', id], queryFn: () => adventureApi.combatant(id), retry: false, refetchOnMount: 'always' as const })) });
  const blockers: Issue[] = [...issues];
  if (!libraryResourceId) blockers.push({ area: 'basics', message: 'Select the existing library module.' });
  else if (library.isError) blockers.push({ area: 'basics', message: 'Library publication could not be checked. Retry the check below.' });
  else if (library.data && library.data.payload.status !== 'published') blockers.push({ area: 'basics', message: 'Publish the linked library Resource through existing Resources management first.' });
  content.resources.filter(r => r.kind === 'map' && !r.hasAsset).forEach(r => blockers.push({ area: 'resources', message: `${r.title}: upload a protected map attachment.` }));
  combatants.forEach((q, i) => { if (q.isError || (q.data && q.data.status !== 'published')) blockers.push({ area: 'encounters', message: `${q.data?.name ?? `Combatant ${i + 1}`}: ${q.isError ? 'could not verify this reference' : 'must be published'}.` }); });
  const checking = (!!libraryResourceId && library.isFetching) || combatants.some(q => q.isFetching);
  const publishDisabled = locked || dirty || !record || checking || blockers.length > 0;
  const act = async () => {
    if (!record || !confirm || dirty || locked || (confirm === 'published' && publishDisabled)) return;
    const result = await mutate(() => confirm === 'delete' ? adventureApi.remove(record) : adventureApi.status(record, confirm), confirm === 'published' ? 'Published. Owners now receive this saved snapshot.' : 'Archived. Owner and campaign access is hidden until republished.');
    if (result) setConfirm(null);
  };
  return <>
    <div className={styles.sectionHeading}><div><h2>Review the working draft</h2><p>Owners receive the latest published snapshot. Saving edits never publishes them.</p></div><Button variant="outline" disabled={checking} onClick={() => { void library.refetch(); combatants.forEach(q => void q.refetch()); }}>Recheck publication requirements</Button></div>
    <section className={styles.reviewStatus} aria-label="Publication requirements">
      {checking && <Loader caption="Checking library and combatant publication…" />}
      {blockers.length ? <><h3>Before publishing</h3><ul>{blockers.map((issue, i) => <li key={i}><Button variant="ghost" tone="neutral" onClick={() => onArea(issue.area)}>{issue.message}</Button></li>)}</ul></> : <><h3>{checking ? 'Checking references' : 'The draft meets the local checks'}</h3><p>The server verifies current references and attachments again when you publish.</p></>}
      {(dirty || !record) && <p>Save the draft before publishing or changing its status.</p>}
      <p>Publication state: <strong>{record?.status ?? 'Not created yet'}</strong>. You are reviewing the working draft; a comparison with the published edition is not available.</p>
      <div className={styles.actions}><Button disabled={publishDisabled} onClick={() => setConfirm('published')}>{record?.status === 'published' ? 'Publish this draft' : 'Publish adventure'}</Button>{record && record.status !== 'archived' && <Button variant="outline" disabled={locked || dirty} onClick={() => setConfirm('archived')}>Archive adventure</Button>}{record?.status === 'draft' && <Button variant="ghost" tone="danger" disabled={locked || dirty} onClick={() => setConfirm('delete')}>Delete never-published draft</Button>}</div>
      {confirm && <section ref={confirmRef} tabIndex={-1} className={styles.confirm} aria-label="Confirm adventure status change"><h3>{confirm === 'published' ? 'Make this saved draft available to all owners?' : confirm === 'archived' ? 'Hide this adventure from owners and campaigns?' : 'Permanently delete this never-published draft?'}</h3><p>{confirm === 'published' ? 'This replaces the published snapshot, including attachments. Existing owners need no new claim. Draft private notes remain private.' : confirm === 'archived' ? 'Existing grants remain, but owner and shared campaign reads stop until the adventure is republished.' : 'The server rejects deletion if this adventure was ever published. This cannot be undone.'}</p><div className={styles.actions}><Button tone={confirm === 'delete' ? 'danger' : 'gold'} disabled={locked || dirty || (confirm === 'published' && publishDisabled)} onClick={act}>Confirm {confirm === 'published' ? 'publication' : confirm === 'archived' ? 'archive' : 'deletion'}</Button><Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button></div></section>}
    </section>
    <article className={styles.manuscript}><p className={styles.eyebrow}>Draft preview · private reference</p><h2>{content.title || 'Untitled adventure'}</h2><AuthoringProse value={content.summary || 'No summary added.'} />
      {content.sections.map((section, index) => <section key={section.id} className={styles.previewSection}><p className={styles.eyebrow}>Section {index + 1}</p><h3>{section.title}</h3>{section.context && <AuthoringProse value={section.context} />}<AuthoringProse value={section.storyText || 'No story text yet.'} />{section.storyweaverNotes && <details className={styles.disclosure}><summary>Private Storyweaver notes</summary><AuthoringProse value={section.storyweaverNotes} /></details>}
        {!!section.links.length && <><h4>Story routes</h4><ul>{section.links.map((link, i) => <li key={i}><strong>{link.label}</strong> → {content.sections.find(s => s.id === link.sectionId)?.title ?? 'Missing section'}{link.context && <AuthoringProse value={link.context} />}</li>)}</ul></>}
        {!!section.resourceIds.length && <p>Resources: {section.resourceIds.map(id => content.resources.find(r => r.id === id)?.title ?? 'Missing resource').join(', ')}</p>}
        {!!section.encounterIds.length && <p>Recommendations: {section.encounterIds.map(id => content.encounters.find(e => e.id === id)?.title ?? 'Missing encounter').join(', ')}</p>}
      </section>)}
      <section className={styles.previewSection}><h3>Resource library · {content.resources.length}</h3>{content.resources.map(r => <details key={r.id} className={styles.disclosure}><summary>{r.title} · {kinds.find(k => k.value === r.kind)?.label} · {r.visibility === 'players' ? 'eligible for sharing' : 'private'}</summary><AuthoringProse value={r.text || 'No text added.'} /><p>{r.hasAsset ? 'Protected attachment present' : 'No attachment'}{r.tags.length > 0 ? ` · ${r.tags.join(', ')}` : ''}</p></details>)}</section>
      <section className={styles.previewSection}><h3>Encounter recommendations · {content.encounters.length}</h3>{content.encounters.map(e => <details key={e.id} className={styles.disclosure}><summary>{e.title}</summary><AuthoringProse value={e.notes || 'No guidance added.'} /><ul>{e.combatants.filter(c => combatants[ids.indexOf(c.combatantId)]?.data !== null).map((c, i) => <li key={i}>{Number.isNaN(c.quantity) ? '?' : c.quantity} × {combatants[ids.indexOf(c.combatantId)]?.data?.name ?? 'Unavailable combatant'}</li>)}</ul></details>)}</section>
    </article>
  </>;
}
