import type { CampaignType, ChatChannelDto } from '@tapestry/types';
export type ChatChannelModalProps = { campaign: CampaignType; channel: ChatChannelDto | null; onClose: () => void; onSaved: () => Promise<unknown> };
