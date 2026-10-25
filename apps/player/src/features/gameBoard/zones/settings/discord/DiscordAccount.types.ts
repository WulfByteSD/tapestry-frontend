import type { DiscordAccountStatus } from '@tapestry/types';

export type DiscordAccountNoticeProps = { campaignId: string; playerId: string };
export type DiscordAccountModalProps = {
  open: boolean;
  account: DiscordAccountStatus;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onLink: () => void;
  onUnlink: () => void;
};
