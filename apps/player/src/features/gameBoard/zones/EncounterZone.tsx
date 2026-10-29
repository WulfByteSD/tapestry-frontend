'use client';

import { useState } from 'react';
import { Button, Loader, Tabs, TextField } from '@tapestry/ui';
import type { EncounterCombatantSnapshot, EncounterParticipant } from '@tapestry/types';
import { useEncounterPreparation } from './encounters/Encounter.hooks';
import EncounterRoster from './encounters/EncounterRoster.component';
import AddParticipantModal from './encounters/AddParticipant.modal';
import CombatantModal from './encounters/Combatant.modal';
import CombatantPreview from './encounters/CombatantPreview.modal';
import TurnOrder from './encounters/TurnOrder.component';
import type { EncounterZoneProps } from './encounters/Encounter.types';
import styles from './encounters/Encounter.module.scss';

export default function EncounterZone(props: EncounterZoneProps) {
  if (!props.isSW) return <section className={styles.zone}><h2>Encounters</h2><p className={styles.empty}>No active encounter. Drafts are private to Storyweavers.</p></section>;
  return <EncounterPreparation {...props} />;
}

function EncounterPreparation({ campaignId, viewerId, isArchived, active }: EncounterZoneProps) {
  const state = useEncounterPreparation(campaignId, viewerId, active, isArchived);
  const [screen, setScreen] = useState('encounter-preparation');
  const [adding, setAdding] = useState(false);
  const [editingCopy, setEditingCopy] = useState<Extract<EncounterParticipant, { kind: 'combatant' }> | null>(null);
  const [preview, setPreview] = useState<EncounterCombatantSnapshot | null>(null);
  const disabled = state.busy || isArchived || state.conflict;
  return <section className={styles.zone} aria-label="Encounter">
    <header className={styles.heading}><div><p className={styles.eyebrow}>Private · Storyweavers</p><h2>Encounters</h2></div>{!isArchived && <Button variant="outline" disabled={state.busy} onClick={state.create}>New draft</Button>}</header>
    {isArchived && <p className={styles.notice}>Archived campaign · Read only</p>}
    <div className={styles.layout}>
      <aside className={styles.draftNav} aria-label="Saved encounter drafts"><h3>Saved drafts</h3>
        {state.list.isLoading ? <Loader size="sm" label="Loading drafts…" tone="gold" /> : state.list.isError ? <div role="alert"><p>Drafts could not be loaded.</p><Button size="sm" variant="outline" onClick={() => void state.list.refetch()}>Try again</Button></div> : !state.list.data?.payload.length ? <p className={styles.muted}>No saved drafts yet.</p> : <ul className={styles.draftList}>{state.list.data.payload.map(draft => <li key={draft.id}><button type="button" className={styles.draftButton} aria-current={state.draft?.id === draft.id ? 'true' : undefined} disabled={state.busy} onClick={() => void state.select(draft.id)}><strong>{draft.title}</strong><span>{draft.participantCount} participant{draft.participantCount === 1 ? '' : 's'}</span></button></li>)}</ul>}
        {(state.list.data?.metadata?.pages ?? 1) > 1 && <div className={styles.pagination}><Button variant="ghost" size="sm" disabled={state.busy || state.page === 1} onClick={() => state.setPage(state.page - 1)}>Previous</Button><span>{state.page}/{state.list.data?.metadata?.pages}</span><Button variant="ghost" size="sm" disabled={state.busy || state.page >= (state.list.data?.metadata?.pages ?? 1)} onClick={() => state.setPage(state.page + 1)}>Next</Button></div>}
      </aside>
      <div className={styles.editor} aria-busy={state.busy}>
        {state.error && <div className={styles.error} role="alert"><p>{state.error}</p>{state.conflict && state.draft && <><p>Reload the latest saved draft before making more changes. Unsaved title and notes require your confirmation before discarding.</p><Button variant="outline" size="sm" disabled={state.busy} onClick={() => void state.select(state.draft!.id)}>Reload saved draft</Button></>}</div>}
        {state.notice && <p className={styles.notice} role="status">{state.notice}{state.dirty && ' Title or notes still have unsaved changes.'}</p>}
        {state.busy && !state.editing ? <div className={styles.welcome} role="status"><Loader tone="gold" label="Opening encounter draft…" /></div> : !state.editing ? <div className={styles.welcome}><p>Open a saved draft.</p>{!isArchived && <Button disabled={state.busy} onClick={state.create}>Create encounter draft</Button>}</div> : <>
          <Tabs activeKey={screen} onChange={setScreen} variant="underline" fit="content" keepMounted={false} ariaLabel="Encounter screens" items={[{ key: 'encounter-preparation', label: 'Preparation', children: <>
          <form onSubmit={event => { event.preventDefault(); void state.save(); }} className={styles.draftForm}>
            <TextField label="Encounter title" required maxLength={160} value={state.title} disabled={disabled} onChange={event => state.setTitle(event.target.value)} placeholder="The watch at the broken bridge" />
            <label className={styles.textareaLabel}>Scene notes<textarea rows={4} maxLength={20000} disabled={disabled} value={state.notes} onChange={event => state.setNotes(event.target.value)} placeholder="What brings the cast together? What might change?" /></label>
            {!isArchived && <div className={styles.saveRow}><span className={styles.muted}>{state.dirty ? 'Unsaved title or notes' : state.draft ? 'Title and notes saved' : 'Save the draft to add participants'}</span><Button type="submit" isLoading={state.busy} disabled={state.conflict || !state.title.trim() || Boolean(state.draft && !state.dirty)}>Save draft</Button></div>}
          </form>
          <section className={styles.rosterSection}><div className={styles.sectionHeading}><h3>Participants{state.draft ? ` · ${state.draft.participants.length}` : ''}</h3>{!isArchived && <Button variant="outline" tone="neutral" disabled={disabled || !state.draft} onClick={() => setAdding(true)}>Add participants</Button>}</div>
            {state.draft ? <EncounterRoster draft={state.draft} disabled={disabled} readOnly={isArchived} onView={setPreview} onEdit={setEditingCopy} onDuplicate={id => { void state.duplicate(id); }} onRemove={id => { void state.remove(id); }} /> : <p className={styles.empty}>Save draft to add participants.</p>}
          </section>
          </> }, { key: 'encounter-turn-order', label: 'Turn Order', disabled: !state.draft, children: state.draft && <TurnOrder key={state.draft.id} draft={state.draft} disabled={disabled} readOnly={isArchived} onTurn={state.turn} onPrepare={() => setScreen('encounter-preparation')} /> }]} />
        </>}
      </div>
    </div>
    {adding && state.draft && !isArchived && <AddParticipantModal requestError={state.error} conflict={state.conflict} onReload={() => { if (state.draft) void state.select(state.draft.id); }} characterIds={state.draft.participants.filter(p => p.kind === 'character').map(p => p.provenance.id)} active={active} campaignId={campaignId} viewerId={viewerId} busy={state.busy} onClose={() => setAdding(false)} onAdd={state.add} />}
    {editingCopy && !isArchived && <CombatantModal requestError={state.error} conflict={state.conflict} onReload={() => { if (state.draft) void state.select(state.draft.id); }} active={active} key={editingCopy.id} participant={editingCopy} busy={state.busy} onClose={() => setEditingCopy(null)} onSave={snapshot => state.update(editingCopy.id, snapshot)} />}
    {preview && <CombatantPreview snapshot={preview} active={active} onClose={() => setPreview(null)} />}
  </section>;
}
