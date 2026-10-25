import type { ChatChannelDto, ChatComposition, ChatSendInput } from '@tapestry/types';
import type { ActiveCharacterState, ChatDraft } from './Chat.types';
export type ChatComposerProps = {
  channel: ChatChannelDto;
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
