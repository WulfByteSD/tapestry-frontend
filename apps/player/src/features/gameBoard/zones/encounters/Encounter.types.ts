import type { SceneBoardState, EncounterScreenRequest } from '../../scenes/Scene.types';
import type { CampaignType, EncounterSceneSummary, EncounterCombatantSnapshot, EncounterDraft, EncounterParticipant } from '@tapestry/types';

export type EncounterZoneProps = { campaignId: string; viewerId: string; isSW: boolean; isArchived: boolean; active: boolean; campaign: CampaignType; scenes: SceneBoardState; onEnterScene: (scene: EncounterSceneSummary) => void; screenRequest?: EncounterScreenRequest };
export type CombatantFormValue = Omit<EncounterCombatantSnapshot, 'statline'> & {
  statline: Omit<EncounterCombatantSnapshot['statline'], 'hp' | 'defenseTN' | 'armor' | 'actions'> & { hp: number | ''; defenseTN: number | ''; armor: number | ''; actions: number | '' };
};
export type CombatantFormProps = { value: CombatantFormValue; onChange: (value: CombatantFormValue) => void; disabled?: boolean };
export type EncounterRecoveryProps = { requestError: string; conflict: boolean; onReload: () => void };
export type CombatantModalProps = EncounterRecoveryProps & { active: boolean; participant: Extract<EncounterParticipant, { kind: 'combatant' }>; busy: boolean; onClose: () => void; onSave: (snapshot: EncounterCombatantSnapshot) => Promise<boolean> };
export type SourceKind = 'character' | 'catalog' | 'personal' | 'custom';
export type EncounterSourceItem = { id: string; name: string; portrait?: string; summary: string; snapshot?: EncounterCombatantSnapshot };
export type EncounterSourcePage = { pages: number; items: EncounterSourceItem[] };
export type AddParticipantProps = EncounterRecoveryProps & { active: boolean; campaignId: string; viewerId: string; characterIds: string[]; busy: boolean; onClose: () => void; onAdd: (kind: Exclude<SourceKind, 'custom'>, id: string) => Promise<boolean> };
export type EncounterRosterProps = { draft: EncounterDraft; disabled: boolean; readOnly: boolean; onView: (snapshot: EncounterCombatantSnapshot) => void; onEdit: (participant: Extract<EncounterParticipant, { kind: 'combatant' }>) => void; onDuplicate: (id: string) => void; onRemove: (id: string) => void };

