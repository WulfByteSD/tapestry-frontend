import type { CampaignType, EncounterDraft, EncounterExchange, EncounterScene, EncounterSceneSummary } from '@tapestry/types';
import type { ActiveCharacterState } from '../chat/Chat.types';
import type { useEncounterScenes } from './Scene.hooks';

export type SceneBoardState = ReturnType<typeof useEncounterScenes>;
export type SceneToolsProps = { state: SceneBoardState; characterState: ActiveCharacterState; viewerId: string; archived: boolean; onManageScene?: (scene: EncounterSceneSummary, screen: EncounterScreen) => void };
export type SceneManagementProps = { state: SceneBoardState; draft: EncounterDraft; campaign: CampaignType; onEnter: (scene: EncounterSceneSummary) => void; archived: boolean; screen?: 'scenes' | 'turns' | 'tracker' };
export type SceneSetupProps = { state: SceneBoardState; draft: EncounterDraft; campaign: CampaignType; scene?: EncounterScene; onDone: () => void };
export type SceneHealthProps = { state: SceneBoardState; scene: EncounterScene; participantId: string; onClose: () => void };
export type SceneHealthModalProps = SceneHealthProps & { open: boolean; suspended: boolean };
export type SceneAttackProps = SceneToolsProps & { scene: EncounterScene; actorParticipantId: string; initialTargetId?: string; onClose: () => void };
export type SceneDefenseProps = { state: SceneBoardState; scene: EncounterScene; exchange: EncounterExchange; characterState: ActiveCharacterState; onClose: () => void };
export type SceneDefenseNoticeProps = { state: SceneBoardState; sceneId: string; characterState: ActiveCharacterState; readOnly: boolean };
export type SceneRollModalProps = { open: boolean; suspended: boolean; busy: boolean; title: string; name: string; portraitUrl?: string; onClose: () => void; children: import('react').ReactNode };
export type SceneExchangeProps = { exchange: EncounterExchange };

export type SceneTrackerProps = { state: SceneBoardState; scene: EncounterScene; readOnly: boolean };
export type SceneTransferProps = { state: SceneBoardState; scene: EncounterScene; onDone: () => void };
export type SceneListProps = { state: SceneBoardState; onEnter: (scene: EncounterSceneSummary) => void };

export type EncounterScreen = 'preparation' | 'scenes' | 'turn-order' | 'tracker';
export type EncounterScreenRequest = { id: string; encounterId: string; screen: EncounterScreen };

export type SceneOverlapProps = { state: SceneBoardState };
