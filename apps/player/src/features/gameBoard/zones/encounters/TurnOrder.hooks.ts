'use client';
import { useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import type { EncounterTurnOrderAction } from '@tapestry/types';
import { moveTurn } from './TurnOrder.helpers';
import type { TurnOrderDropTarget, TurnOrderProps } from './TurnOrder.types';

export function useTurnOrder({ draft, disabled, readOnly, onTurn }: TurnOrderProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TurnOrderDropTarget | null>(null);
  const [participantId, setParticipantId] = useState('');
  const [pendingAction, setPendingAction] = useState<EncounterTurnOrderAction['action'] | null>(null);
  const mutationPending = useRef(false);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const focusAfterSave = useRef<string | null>(null);
  useEffect(() => {
    if (!disabled && !pendingAction && focusAfterSave.current) {
      const row = rowRefs.current.get(focusAfterSave.current);
      (row?.querySelector<HTMLButtonElement>('[data-reorder-handle]') ?? row)?.focus();
      focusAfterSave.current = null;
    }
  }, [disabled, draft.revision, pendingAction]);
  const runTurn = async (action: EncounterTurnOrderAction) => {
    if (disabled || readOnly || mutationPending.current) return false;
    mutationPending.current = true;
    setPendingAction(action.action);
    try {
      return await onTurn(action);
    } finally {
      mutationPending.current = false;
      setPendingAction(null);
    }
  };
  const reorder = (slotId: string, targetId: string, after: boolean) => {
    if (disabled || readOnly || mutationPending.current) return;
    const slotIds = moveTurn(draft.turnOrder.slots, slotId, targetId, after);
    if (slotIds.every((id, index) => id === draft.turnOrder.slots[index].id)) return;
    focusAfterSave.current = slotId;
    void runTurn({ action: 'reorder', slotIds });
  };
  const move = (slotId: string, direction: -1 | 1) => {
    const index = draft.turnOrder.slots.findIndex(slot => slot.id === slotId);
    const target = draft.turnOrder.slots[index + direction];
    if (target) reorder(slotId, target.id, direction === 1);
  };
  const endDrag = () => { setDraggedId(null); setDropTarget(null); };
  const dragOver = (event: DragEvent<HTMLLIElement>, slotId: string) => {
    if (disabled || readOnly || mutationPending.current || !draggedId || draggedId === slotId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const bounds = event.currentTarget.getBoundingClientRect();
    setDropTarget({ slotId, after: event.clientY > bounds.top + bounds.height / 2 });
  };
  const drop = (event: DragEvent<HTMLLIElement>, slotId: string) => {
    event.preventDefault();
    if (draggedId && dropTarget?.slotId === slotId) reorder(draggedId, slotId, dropTarget.after);
    endDrag();
  };
  const selectedParticipantId = draft.participants.some(participant => participant.id === participantId) ? participantId : draft.participants[0]?.id ?? '';
  return { draggedId, setDraggedId, dropTarget, rowRefs, endDrag, dragOver, drop, move, selectedParticipantId, setParticipantId, pendingAction, runTurn };
}
