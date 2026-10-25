import type { ChatMessageDto } from '@tapestry/types';
export type ChatTranscriptProps = {
  channelId: string;
  messages: ChatMessageDto[];
  loading: boolean;
  error: boolean;
  hasOlder: boolean;
  loadingOlder: boolean;
  currentUserId: string;
  isSW: boolean;
  readOnly: boolean;
  replyDisabled: boolean;
  onOlder: () => Promise<unknown>;
  onRetry: () => void;
  onRead: (channelId: string, messageId: string) => Promise<void>;
  onReply: (message: ChatMessageDto) => void;
  onEdit: (message: ChatMessageDto) => void;
  onRemove: (message: ChatMessageDto) => void;
};
