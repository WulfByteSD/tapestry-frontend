'use client';
import { useState } from 'react';
import { Avatar, Button, Loader, Modal, TextField } from '@tapestry/ui';
import type { EncounterCombatantSnapshot } from '@tapestry/types';
import { useSheetModalFocus } from '@/features/characters/characterSheetScreen/SheetModal.hooks';
import CombatantForm from './Combatant.form';
import CombatantPreview from './CombatantPreview.modal';
import { useEncounterSources } from './EncounterSources.hooks';
import { useEncounterLeaveGuard } from './Encounter.hooks';
import { emptyCombatant, restoreAddFocus } from './Encounter.helpers';
import type { AddParticipantProps, SourceKind } from './Encounter.types';
import styles from './Encounter.module.scss';

export default function AddParticipantModal(props: AddParticipantProps) {
  const state = useEncounterSources(props);
  const [preview, setPreview] = useState<EncounterCombatantSnapshot | null>(null);
  const busy = props.busy || state.saving;
  const dirty = !state.savedId && JSON.stringify(state.value) !== JSON.stringify(emptyCombatant());
  useEncounterLeaveGuard(dirty);
  useSheetModalFocus(props.active, 'encounter-add-dialog', 'encounter-add-title');
  const close = () => { if (!busy && (!dirty || window.confirm('Discard this unsaved custom combatant?'))) props.onClose(); };
  return <><Modal open={props.active} title={<span id="encounter-add-title">Add to the encounter</span>} wrapClassName="encounter-add-dialog" width={800} onCancel={close} maskClosable={false} footer={null}>
    <div className={styles.sourceTabs} role="group" aria-label="Participant source">{([['character', 'Campaign characters'], ['catalog', 'Catalog'], ['personal', 'My library'], ['custom', 'Create custom']] as [SourceKind, string][]).map(([key, label]) => <Button key={key} type="button" size="sm" variant={state.source === key ? 'solid' : 'outline'} tone={state.source === key ? 'gold' : 'neutral'} aria-pressed={state.source === key} disabled={busy} onClick={() => state.changeSource(key)}>{label}</Button>)}</div>
    {(state.error || props.requestError) && <p className={styles.error} role="alert">{state.error || props.requestError}</p>}
    <p className={styles.addStatus} role="status" aria-live="polite">{state.notice}</p>
    {props.conflict && <div className={styles.notice}><p>The encounter changed. Reload it before retrying. Your custom combatant stays here.</p><Button size="sm" variant="outline" disabled={busy} onClick={props.onReload}>Reload encounter</Button></div>}
    {state.source === 'custom' ? <>
      <CombatantForm value={state.value} onChange={state.setValue} disabled={busy || Boolean(state.savedId)} />
      <div className={styles.modalActions}><Button variant="outline" tone="neutral" disabled={busy} onClick={close}>Done</Button>{state.savedId && <Button variant="ghost" tone="neutral" disabled={busy} onClick={state.newCustom}>New custom</Button>}<Button isLoading={busy} disabled={props.conflict} onClick={event => { const button = event.currentTarget; void state.saveCustom().finally(() => restoreAddFocus(button)); }}>{state.savedId ? state.customAdded ? 'Add another' : 'Retry adding saved combatant' : 'Save to my library and add'}</Button></div>
    </> : <>
      <TextField label="Search by name" maxLength={100} value={state.keyword} onChange={event => state.setKeyword(event.target.value)} />
      {state.options.isLoading ? <div className={styles.empty}><Loader label="Loading participants…" tone="gold" /></div> : state.options.isError ? <div className={styles.error} role="alert"><p>Could not load this source.</p><Button size="sm" variant="outline" onClick={() => void state.options.refetch()}>Try again</Button></div> : <>
        {!state.options.data?.items.length ? <p className={styles.empty}>{state.search ? 'No matches.' : state.source === 'personal' ? 'Your library is empty.' : state.source === 'character' ? 'No campaign characters available.' : 'No published combatants available.'}</p> : <ul className={styles.sourceList}>{state.options.data.items.map(entry => <li className={styles.sourceRow} key={entry.id}><Avatar size="sm" alt={entry.name} name={entry.name} src={entry.portrait} /><div className={styles.rowBody}><strong>{entry.name}</strong><p className={styles.stats}>{entry.summary}</p></div><div className={styles.sourceActions}>{entry.snapshot && <Button size="sm" variant="ghost" tone="neutral" aria-label={`View ${entry.name}`} onClick={() => setPreview(entry.snapshot!)}>View</Button>}<Button size="sm" variant="outline" disabled={busy || props.conflict || (state.source === 'character' && props.characterIds.includes(entry.id))} aria-label={state.source === 'character' && props.characterIds.includes(entry.id) ? `${entry.name} already added` : `Add ${entry.name}`} onClick={event => { const button = event.currentTarget; void state.add(entry.id).finally(() => restoreAddFocus(button)); }}>{state.source === 'character' && props.characterIds.includes(entry.id) ? 'Already added' : 'Add'}</Button></div></li>)}</ul>}
        {(state.options.data?.pages ?? 1) > 1 && <div className={styles.pagination}><Button size="sm" variant="ghost" disabled={busy || state.page <= 1} onClick={() => state.setPage(state.page - 1)}>Previous</Button><span>Page {state.page} of {state.options.data?.pages}</span><Button size="sm" variant="ghost" disabled={busy || state.page >= (state.options.data?.pages ?? 1)} onClick={() => state.setPage(state.page + 1)}>Next</Button></div>}
      </>}
      <div className={styles.modalActions}><Button variant="outline" tone="neutral" disabled={busy} onClick={close}>Done</Button></div>
    </>}
  </Modal>{preview && <CombatantPreview snapshot={preview} active={props.active} onClose={() => setPreview(null)} />}</>;
}



