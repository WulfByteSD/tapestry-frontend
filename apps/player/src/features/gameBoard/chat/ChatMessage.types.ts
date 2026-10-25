import type { ChatMessageDto } from '@tapestry/types';
export type ChatMessageProps = {
  message: ChatMessageDto;
  currentUserId: string;
  isSW: boolean;
  readOnly: boolean;
  replyDisabled: boolean;
  onReply: (message: ChatMessageDto) => void;
  onEdit: (message: ChatMessageDto) => void;
  onRemove: (message: ChatMessageDto) => void;
};
