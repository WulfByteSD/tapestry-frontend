import type { CampaignRollDto } from '@tapestry/api-client';

export type RollHistoryProps = { campaignId: string; currentUserId: string };
export type RollHistoryRowProps = { roll: CampaignRollDto; currentUserId: string };
