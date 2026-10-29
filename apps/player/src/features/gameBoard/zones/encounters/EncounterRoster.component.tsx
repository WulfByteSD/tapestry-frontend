'use client';
import { Avatar, Button } from '@tapestry/ui';
import { combatantSummary } from './Encounter.helpers';
import type { EncounterRosterProps } from './Encounter.types';
import styles from './Encounter.module.scss';

export default function EncounterRoster({ draft, disabled, readOnly, onView, onEdit, onDuplicate, onRemove }: EncounterRosterProps) {
  if (!draft.participants.length) return <p className={styles.empty}>No participants yet.</p>;
  return <ul className={styles.roster}>{draft.participants.map(participant => <li key={participant.id} className={styles.rosterRow}>
    <Avatar size="sm" alt={participant.snapshot.name} name={participant.snapshot.name} src={participant.kind === 'combatant' ? participant.snapshot.media?.portraitUrl : participant.snapshot.avatarUrl} />
    <div className={styles.rowBody}><strong>{participant.snapshot.name}</strong>
      <span className={styles.source}>{participant.kind === 'character' ? 'Campaign character' : participant.provenance.kind === 'catalog' ? 'Catalog' : 'My library'}</span>
      <p className={styles.stats}>{participant.kind === 'combatant' ? combatantSummary(participant.snapshot) : `${participant.snapshot.archetypeKey || 'Archetype not set'} · Weave ${participant.snapshot.weaveLevel}`}</p>
    </div>
    {(participant.kind === 'combatant' || !readOnly) && <div className={styles.rowActions}>{participant.kind === 'combatant' && <Button size="sm" variant="outline" tone="neutral" aria-label={`View ${participant.snapshot.name}`} onClick={() => onView(participant.snapshot)}>View</Button>}{!readOnly && <>{participant.kind === 'combatant' && <><Button size="sm" variant="ghost" tone="neutral" disabled={disabled} onClick={() => onEdit(participant)}>Edit copy</Button><Button size="sm" variant="ghost" tone="neutral" disabled={disabled} onClick={() => onDuplicate(participant.id)} aria-label={`Duplicate ${participant.snapshot.name}`}>Duplicate</Button></>}<Button size="sm" variant="ghost" tone="danger" disabled={disabled} onClick={() => onRemove(participant.id)} aria-label={`Remove ${participant.snapshot.name}`}>Remove</Button></>}</div>}
  </li>)}</ul>;
}
