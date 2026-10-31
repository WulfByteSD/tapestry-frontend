import type { ChatChannelDto, ChatComposition, ChatSendInput, EncounterScene } from '@tapestry/types';
import type { SceneBoardState } from '../scenes/Scene.types';
import type { ActiveCharacterState, ChatDraft } from './Chat.types';
export type ChatComposerProps = {
  channel: ChatChannelDto;
  scene: EncounterScene | null;
  scenes: SceneBoardState;
  draft: ChatDraft;
  currentUserId: string;
  playerName: string;
  isSW: boolean;
  readOnlyReason: string | null;
  characterState: ActiveCharacterState;
  onContent: (value: string) => void;
  onComposition: (value: ChatComposition) => void;
  onClearReply: () => void;
  onDiscardAttempt: () => void;
  onSend: (speaker: ChatSendInput['speaker'], speakerLabel: string) => Promise<void>;
};
