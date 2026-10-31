import type { EncounterDraft, EncounterParticipant, EncounterScene } from '@tapestry/types';

/** The turn editor needs only identity snapshots; preserve its existing interaction model. */
export function sceneTurnDraft(scene: EncounterScene): EncounterDraft {
  const participants: EncounterParticipant[] = scene.participants.map(entry => entry.kind === 'character'
    ? { id: entry.id, kind: 'character', provenance: { kind: 'character', id: entry.characterId ?? entry.id }, snapshot: { name: entry.name, avatarUrl: entry.portraitUrl, weaveLevel: 0 } }
    : { id: entry.id, kind: 'combatant', provenance: { kind: 'personal', id: entry.id }, snapshot: { name: entry.name, category: 'npc', disposition: 'neutral', statline: { hp: 0, defenseTN: entry.defenseTN ?? 0, harm: '', armor: 0, move: '', actions: 1, tags: [] }, media: { portraitUrl: entry.portraitUrl } } });
  return { id: scene.id, campaignId: scene.campaignId, title: scene.title, notes: '', revision: scene.revision, participants, turnOrder: scene.turnOrder, createdAt: scene.createdAt, updatedAt: scene.updatedAt };
}

export function currentSceneTurn(scene: EncounterScene) {
  const slot = scene.turnOrder.slots.find(entry => entry.id === scene.turnOrder.currentSlotId);
  return scene.participants.find(entry => entry.id === slot?.participantId)?.name ?? 'Not started';
}
