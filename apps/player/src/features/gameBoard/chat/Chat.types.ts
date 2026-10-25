import type { CampaignType, CampaignRole, ChatComposition, ChatMessageDto, ChatSendInput } from '@tapestry/types';
import type { useActiveCharacter } from '../useActiveCharacter';
import type { useChatBoard } from './Chat.hooks';

export type ActiveCharacterState = ReturnType<typeof useActiveCharacter>;
export type ChatDraft = {
  content: string;
  composition?: ChatComposition;
  replyTo: ChatMessageDto | null;
  attempt?: { channelId: string; input: ChatSendInput; speakerLabel: string; channelName: string };
  status: 'idle' | 'sending' | 'failed';
  error?: string;
};
export type ChatBoardState = ReturnType<typeof useChatBoard>;
export type ChatProps = {
  campaign: CampaignType;
  currentUserId: string;
  playerName: string;
  userRole: CampaignRole | undefined;
  isSW: boolean;
  characterState: ActiveCharacterState;
  chat: ChatBoardState;
};
