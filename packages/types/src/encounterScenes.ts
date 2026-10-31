import type { EncounterParticipant, EncounterTurnOrder, EncounterTurnOrderAction } from './encounters';

export type EncounterStatus = 'draft' | 'active' | 'ended';
export type EncounterSceneStatus = 'draft' | 'open' | 'completed';
export type EncounterResolutionMode = 'defense_tn' | 'opposed';
export interface EncounterHealthState { hp: { current: number; max: number; temp: number }; conditions: Array<{ key: string; label?: string; notes?: string; stacks?: number; source?: string; appliedAt?: string; expiresAt?: string | null }> }
export interface EncounterSceneParticipant {
  id: string; kind: 'character' | 'combatant'; name: string; portraitUrl?: string;
  characterId?: string; ownerPlayerId?: string; defenseTN?: number; revealed: boolean;
  /** Storyweaver only. */ snapshot?: EncounterParticipant['snapshot'];
  /** Storyweaver only; a player's live sheet remains the source for their own resources. */ health?: EncounterHealthState;
}
export interface EncounterSceneSummary {
  id: string; encounterId: string; campaignId: string; encounterTitle: string; title: string; status: EncounterSceneStatus;
  visibility: 'campaign' | 'private'; channelId: string | null; mode: EncounterResolutionMode;
  canManage: boolean; canPost: boolean; playableCharacterIds: string[];
}
export interface EncounterScene extends EncounterSceneSummary {
  revision: number; encounterStatus: EncounterStatus; audiencePlayerIds: string[];
  participants: EncounterSceneParticipant[]; turnOrder: EncounterTurnOrder;
  createdAt: string; updatedAt: string;
}
export interface CreateEncounterSceneInput {
  title: string; visibility: 'campaign' | 'private'; mode: EncounterResolutionMode;
  channel: { kind: 'existing'; channelId: string } | { kind: 'new' } | { kind: 'standalone' };
  participantIds: string[]; audiencePlayerIds?: string[]; confirmOverlap?: boolean;
}
export interface UpdateEncounterSceneInput {
  revision: number; title?: string; mode?: EncounterResolutionMode;
  participantIds?: string[]; audiencePlayerIds?: string[]; revealedParticipantIds?: string[];
  confirmOverlap?: boolean;
}
export interface EncounterOverlap { characterId: string; characterName: string; encounterId?: string; encounterTitle: string }
export type EncounterSceneMutationResult = { requiresConfirmation: false; scene: EncounterScene } | { requiresConfirmation: true; overlaps: EncounterOverlap[] };
export interface SceneLifecycleInput { revision: number; action: 'open' | 'complete' | 'reopen'; confirmOverlap?: boolean }
export type SceneTurnOrderInput = { revision: number } & EncounterTurnOrderAction;
export interface TransferSceneParticipantsInput { revision: number; targetSceneId: string; targetRevision: number; participantIds: string[] }
export interface SceneHealthActionInput {
  participantId: string; action: 'harm' | 'heal' | 'set_hp' | 'add_condition' | 'remove_condition';
  amount?: number; condition?: { key: string; label?: string; notes?: string }; notes?: string;
  allowBlockedWithoutCondition?: boolean; correctionOf?: string; sourceParticipantId?: string; exchangeId?: string;
}
export interface SceneHealthPreview {
  token: string; participantId: string; before: EncounterHealthState; after: EncounterHealthState;
  protection: number; incomingHarm: number; effectiveHarm: number; tempAbsorbed: number;
  fullyBlocked: boolean; suggestsCondition: boolean; expiresAt: string;
}
export interface ApplySceneHealthInput { token: string; requestKey: string }
export interface EncounterHealthAudit {
  exchangeId?: string;
  id: string; characterId?: string; participantId: string; action: SceneHealthActionInput['action'];
  before: EncounterHealthState; after: EncounterHealthState; notes?: string; correctionOf?: string;
  sceneId?: string; encounterId?: string; actorPlayerId?: string; actorName?: string; sourceLabel?: string; sceneTitle?: string; encounterTitle?: string; calculation?: { protection: number; incomingHarm: number; effectiveHarm: number; tempAbsorbed: number; allowBlockedWithoutCondition: boolean }; createdAt: string;
}
export interface SceneAttackInput {
  requestKey: string; actorParticipantId: string; targetParticipantId: string;
  aspectValue?: number; combatantAttackIndex?: number;
  aspectKey?: string; skillKey?: string; weaponInstanceId?: string; attackProfileKey?: string;
  edge?: boolean; burden?: boolean; modifier?: number;
}
export interface SceneDefenseInput { requestKey: string; aspectKey: string; aspectValue?: number; skillKey?: string; modifier?: number; edge?: boolean; burden?: boolean }
export interface EncounterRollSnapshot { profileName?: string; harm?: string; range?: string; id: string; total: number; allRolls: number[]; keptRolls: number[]; breakdown: string; aspectUsed?: string; rolledAt: string }
export interface EncounterExchange {
  id: string; sceneId: string; encounterId: string; mode: EncounterResolutionMode;
  actorKind?: 'character' | 'combatant'; targetKind?: 'character' | 'combatant'; targetCharacterId?: string;
  actorParticipantId: string; targetParticipantId: string; actorName: string; targetName: string;
  status: 'pending' | 'resolved' | 'cancelled'; outcome: 'hit' | 'miss' | null;
  targetNumber?: number; attack: EncounterRollSnapshot; defense?: EncounterRollSnapshot;
  createdAt: string; updatedAt: string;
}
export interface SceneExchangePage { items: EncounterExchange[]; nextCursor: string | null }
export interface CharacterHealthAuditPage { items: EncounterHealthAudit[]; nextCursor: string | null }



