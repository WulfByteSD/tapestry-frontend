'use client';
import { useState } from 'react';
import { Button, Modal } from '@tapestry/ui';
import { useSheetModalFocus } from '@/features/characters/characterSheetScreen/SheetModal.hooks';
import CombatantForm from './Combatant.form';
import { combatantIssue, snapshotFromForm } from './Encounter.helpers';
import { useEncounterLeaveGuard } from './Encounter.hooks';
import type { CombatantFormValue, CombatantModalProps } from './Encounter.types';
import styles from './Encounter.module.scss';

export default function CombatantModal({ active, participant, busy, onClose, onSave, requestError, conflict, onReload }: CombatantModalProps) {
  const [value, setValue] = useState<CombatantFormValue>(participant.snapshot);
  const [error, setError] = useState('');
  useEncounterLeaveGuard(JSON.stringify(value) !== JSON.stringify(participant.snapshot));
  useSheetModalFocus(active, 'encounter-edit-dialog', 'encounter-edit-title');
  const close = () => { if (!busy && (JSON.stringify(value) === JSON.stringify(participant.snapshot) || window.confirm('Discard changes to this encounter copy?'))) onClose(); };
  const save = async () => {
    const issue = combatantIssue(value);
    if (issue) { setError(issue); return; }
    if (await onSave(snapshotFromForm(value))) onClose();
    else setError('This copy was not saved. Check the encounter message, then retry or close this editor. Your edits are still here.');
  };
  return <Modal open={active} title={<span id="encounter-edit-title">Edit encounter copy</span>} wrapClassName="encounter-edit-dialog" width={760} onCancel={close} onOk={() => void save()} okText="Save encounter copy" confirmLoading={busy} okButtonProps={{ disabled: conflict }} cancelButtonProps={{ disabled: busy }} maskClosable={false}>
    {(requestError || error) && <p className={styles.error} role="alert">{requestError || error}</p>}
    {conflict && <div className={styles.notice}><p>Reload the latest encounter, then review and retry saving this copy. Your copy edits stay in this window.</p><Button size="sm" variant="outline" disabled={busy} onClick={onReload}>Reload encounter</Button></div>}
    <CombatantForm value={value} onChange={setValue} disabled={busy} />
  </Modal>;
}

