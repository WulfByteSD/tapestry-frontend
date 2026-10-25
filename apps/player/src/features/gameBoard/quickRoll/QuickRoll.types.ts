import type { CampaignRole, CampaignType, CharacterSheet } from '@tapestry/types';
import type { useActiveCharacter } from '../useActiveCharacter';

export type QuickRollProps = {
  open: boolean;
  onClose: () => void;
  campaign: CampaignType;
  currentUserId: string;
  playerName: string;
  userRole: CampaignRole | undefined;
  characterState: ReturnType<typeof useActiveCharacter>;
};

export type QuickRollFormProps = Omit<QuickRollProps, 'open'>;
export type QuickRollDraftProps = {
  campaignId: string;
  playerId: string;
  character: CharacterSheet | null;
};
export type RollCondition = 'normal' | 'edge' | 'burden';
