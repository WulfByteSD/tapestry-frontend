import type { ChatMessageDto } from '@tapestry/types';
export type ChatMessageModalProps = { campaignId: string; message: ChatMessageDto; action: 'edit' | 'remove'; onClose: () => void; onSaved: () => Promise<unknown> };
