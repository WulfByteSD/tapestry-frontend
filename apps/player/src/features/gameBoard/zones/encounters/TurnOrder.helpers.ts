import type { EncounterParticipant, EncounterTurnSlot } from '@tapestry/types';
import type { TurnOrderRow } from './TurnOrder.types';

export function participantNames(participants: EncounterParticipant[]) {
  const counts = new Map<string, number>();
  const seen = new Map<string, number>();
  for (const participant of participants) counts.set(participant.snapshot.name, (counts.get(participant.snapshot.name) ?? 0) + 1);
  return new Map(participants.map(participant => {
    const name = participant.snapshot.name;
    const index = (seen.get(name) ?? 0) + 1;
    seen.set(name, index);
    return [participant.id, counts.get(name)! > 1 ? `${name} ${index}` : name];
  }));
}

export function turnRows(participants: EncounterParticipant[], slots: EncounterTurnSlot[]): TurnOrderRow[] {
  const names = participantNames(participants);
  const byId = new Map(participants.map(participant => [participant.id, participant]));
  const seen = new Map<string, number>();
  const totals = new Map<string, number>();
  for (const slot of slots) totals.set(slot.participantId, (totals.get(slot.participantId) ?? 0) + 1);
  return slots.flatMap(slot => {
    const participant = byId.get(slot.participantId);
    if (!participant) return [];
    const occurrence = (seen.get(participant.id) ?? 0) + 1;
    seen.set(participant.id, occurrence);
    return [{ ...slot, participant, name: names.get(participant.id)!, portrait: participant.kind === 'combatant' ? participant.snapshot.media?.portraitUrl : participant.snapshot.avatarUrl, occurrence, total: totals.get(participant.id)! }];
  });
}

export function moveTurn(slots: EncounterTurnSlot[], slotId: string, targetId: string, after = false): string[] {
  const ids = slots.map(slot => slot.id);
  if (slotId === targetId || !ids.includes(slotId) || !ids.includes(targetId)) return ids;
  const remaining = ids.filter(id => id !== slotId);
  remaining.splice(remaining.indexOf(targetId) + (after ? 1 : 0), 0, slotId);
  return remaining;
}
