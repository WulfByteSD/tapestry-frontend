/** Preparation snapshots only; these fields never track live combat state. */
export interface EncounterCombatantSnapshot {
  name: string;
  category: 'npc' | 'creature' | 'unwoven' | 'boss' | 'ally' | 'hazard';
  disposition: 'hostile' | 'neutral' | 'friendly';
  tier?: string;
  origin?: string;
  role?: string;
  perks?: string[];
  statline: { hp: number; defenseTN: number; harm: string; armor: number; move: string; actions: number; tags: string[] };
  attacks?: Array<{ name: string; harm: string; range?: string; notes?: string }>;
  abilities?: Array<{ name: string; text: string; cooldown?: string }>;
  loreCheck?: { skill?: string; tn?: number; villagers?: string[]; priests?: string[]; scholars?: string[]; soldiers?: string[] };
  backgroundBehavior?: string;
  whereFound?: string[];
  tactics?: string[];
  hooks?: string[];
  notes?: { public?: string; gm?: string };
  media?: { portraitUrl?: string; tokenUrl?: string; bannerUrl?: string };
}
export interface EncounterCharacterSnapshot { name: string; avatarUrl?: string; archetypeKey?: string; weaveLevel: number }
export type EncounterParticipant = {
  id: string;
  kind: 'combatant';
  provenance: { kind: 'catalog' | 'personal'; id: string };
  snapshot: EncounterCombatantSnapshot;
} | {
  id: string;
  kind: 'character';
  provenance: { kind: 'character'; id: string };
  snapshot: EncounterCharacterSnapshot;
};
export interface EncounterTurnSlot { id: string; participantId: string }
export interface EncounterTurnOrder { round: number; slots: EncounterTurnSlot[]; currentSlotId: string | null }
export type EncounterTurnOrderAction =
  | { action: 'reorder'; slotIds: string[] }
  | { action: 'add'; participantId: string }
  | { action: 'remove'; slotId: string }
  | { action: 'select'; slotId: string }
  | { action: 'advance' }
  | { action: 'next-round' };
export type UpdateEncounterTurnOrderInput = { revision: number } & EncounterTurnOrderAction;
export interface EncounterDraft {
  id: string;
  campaignId: string;
  title: string;
  notes: string;
  revision: number;
  participants: EncounterParticipant[];
  turnOrder: EncounterTurnOrder;
  createdAt: string;
  updatedAt: string;
}
export interface EncounterLibraryEntry { id: string; revision: number; snapshot: EncounterCombatantSnapshot; createdAt: string; updatedAt: string }
export type EncounterDraftSummary = Omit<EncounterDraft, 'notes' | 'participants' | 'turnOrder'> & { participantCount: number };
export interface EncounterCatalogEntry { id: string; snapshot: EncounterCombatantSnapshot }
export interface EncounterCharacterOption { id: string; snapshot: EncounterCharacterSnapshot }
export interface CreateEncounterDraftInput { title: string; notes?: string }
export interface UpdateEncounterDraftInput { revision: number; title?: string; notes?: string }
export interface AddEncounterParticipantInput { revision: number; source: { kind: 'catalog' | 'personal' | 'character'; id: string } }
export interface UpdateEncounterParticipantInput { revision: number; snapshot: EncounterCombatantSnapshot }
export interface EncounterListQuery { keyword?: string; pageNumber?: number; pageLimit?: number }
