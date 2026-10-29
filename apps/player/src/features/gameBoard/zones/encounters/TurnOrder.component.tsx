'use client';
import { Avatar, Button, SelectField } from '@tapestry/ui';
import { useTurnOrder } from './TurnOrder.hooks';
import { participantNames, turnRows } from './TurnOrder.helpers';
import type { TurnOrderProps } from './TurnOrder.types';
import styles from './TurnOrder.module.scss';

export default function TurnOrder(props: TurnOrderProps) {
  const { draft, disabled, readOnly, onTurn, onPrepare } = props;
  const state = useTurnOrder(props);
  const rows = turnRows(draft.participants, draft.turnOrder.slots);
  const names = participantNames(draft.participants);
  const currentIndex = rows.findIndex(row => row.id === draft.turnOrder.currentSlotId);
  const current = rows[currentIndex];
  const next = rows.length ? rows[(currentIndex + 1) % rows.length] : undefined;
  const wraps = Boolean(current && currentIndex === rows.length - 1);

  return <section className={styles.turnOrder} aria-label="Turn order">
    <header className={styles.heading}>
      <h3>{draft.title}</h3><p className={styles.round}>Round <strong>{draft.turnOrder.round}</strong></p>
    </header>
    {!draft.participants.length ? <div className={styles.empty}><p>Add participants in Preparation to arrange their turns.</p><Button variant="outline" tone="neutral" onClick={onPrepare}>Go to Preparation</Button></div> : <>
      <div className={styles.currentLine}>
        <div className={styles.currentIdentity}>
          {current && <Avatar size="lg" name={current.name} alt={current.name} src={current.portrait} />}
          <div><p className={styles.label}>Current turn</p><strong className={styles.currentName}>{current?.name ?? 'Not started'}</strong>{current && <p className={styles.detail}>Slot {currentIndex + 1}{current.total > 1 && ` · Turn ${current.occurrence} of ${current.total}`}</p>}</div>
        </div>
        {!readOnly && <Button disabled={disabled || !rows.length || (wraps && draft.turnOrder.round >= 1000000)} onClick={() => void onTurn({ action: 'advance' })}>{current ? 'Next turn' : 'Start round'}</Button>}
      </div>
      {next && <p className={styles.upNext}><span>Up next{wraps ? ` · Round ${draft.turnOrder.round + 1}` : ''}</span><strong>{next.name}</strong>{next.total > 1 && <span>Turn {next.occurrence} of {next.total}</span>}</p>}
      <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">Round {draft.turnOrder.round}. {current ? `Current: ${current.name}, slot ${currentIndex + 1}.` : 'Round not started.'} {next ? `Up next: ${next.name}${wraps ? ', next round' : ''}.` : 'No turns in the order.'}</p>
      <div className={styles.orderHeading}><h4>Turn order</h4><span>{rows.length} turn{rows.length === 1 ? '' : 's'}</span></div>
      {!rows.length ? <p className={styles.empty}>No turns in the order. Choose a participant below to add a turn.</p> : <ol className={styles.order} aria-label="Ordered turns">
        {rows.map((row, index) => <li
          key={row.id}
          ref={element => { if (element) state.rowRefs.current.set(row.id, element); else state.rowRefs.current.delete(row.id); }}
          tabIndex={-1}
          aria-current={row.id === current?.id ? 'step' : undefined}
          className={[styles.row, row.id === current?.id && styles.activeRow, state.draggedId === row.id && styles.dragged, state.dropTarget?.slotId === row.id && (state.dropTarget.after ? styles.dropAfter : styles.dropBefore)].filter(Boolean).join(' ')}
          onDragOver={event => state.dragOver(event, row.id)}
          onDrop={event => state.drop(event, row.id)}
        >
          {!readOnly && <Button
            type="button" variant="ghost" tone="neutral" size="sm" className={styles.handle}
            disabled={disabled} draggable={!disabled} data-reorder-handle
            aria-label={`Reorder ${row.name}, slot ${index + 1}. Use up and down arrow keys.`}
            title="Drag to reorder, or use arrow keys"
            onDragStart={event => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', row.id); state.setDraggedId(row.id); }}
            onDragEnd={state.endDrag}
            onKeyDown={event => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); state.move(row.id, event.key === 'ArrowUp' ? -1 : 1); } }}
          ><span aria-hidden="true">⠿</span></Button>}
          <span className={styles.position}>{index + 1}</span>
          <Avatar size="sm" name={row.name} alt={row.name} src={row.portrait} />
          <div className={styles.identity}><strong>{row.name}</strong><span>{row.id === current?.id ? 'Current' : row.id === next?.id ? 'Up next' : row.participant.kind === 'character' ? 'Character' : 'Combatant'}{row.total > 1 && ` · Turn ${row.occurrence} of ${row.total}${row.occurrence > 1 ? ' · Extra turn' : ''}`}</span></div>
          {!readOnly && <div className={styles.actions}>
            <Button type="button" size="sm" variant="ghost" tone="neutral" disabled={disabled || index === 0} aria-label={`Move ${row.name}, slot ${index + 1}, up`} onClick={() => state.move(row.id, -1)}>↑</Button>
            <Button type="button" size="sm" variant="ghost" tone="neutral" disabled={disabled || index === rows.length - 1} aria-label={`Move ${row.name}, slot ${index + 1}, down`} onClick={() => state.move(row.id, 1)}>↓</Button>
            <Button type="button" size="sm" variant="outline" tone="neutral" disabled={disabled || row.id === current?.id} aria-label={`Set ${row.name}, slot ${index + 1}, as current turn`} onClick={() => void onTurn({ action: 'select', slotId: row.id })}>Set current</Button>
            <Button type="button" size="sm" variant="ghost" tone="danger" disabled={disabled} aria-label={`Remove ${row.name}, slot ${index + 1}, from turn order`} onClick={() => void onTurn({ action: 'remove', slotId: row.id })}>Remove turn</Button>
          </div>}
        </li>)}
      </ol>}
      {!readOnly && <form className={styles.addTurn} onSubmit={event => { event.preventDefault(); if (state.selectedParticipantId && rows.length < 200) void onTurn({ action: 'add', participantId: state.selectedParticipantId }); }}>
        <SelectField label="Add a turn for" value={state.selectedParticipantId} disabled={disabled || rows.length >= 200} options={draft.participants.map(participant => ({ value: participant.id, label: names.get(participant.id)! }))} onChange={event => state.setParticipantId(event.target.value)} />
        <Button type="submit" variant="outline" disabled={disabled || !state.selectedParticipantId || rows.length >= 200}>Add turn</Button>
        {rows.length >= 200 && <p className={styles.limit}>Turn order is full (200 turns).</p>}
      </form>}
    </>}
  </section>;
}
