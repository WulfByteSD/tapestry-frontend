import type { EncounterDraft, EncounterParticipant, EncounterTurnOrderAction, EncounterTurnSlot } from '@tapestry/types';

export type TurnOrderProps = {
  draft: EncounterDraft;
  disabled: boolean;
  readOnly: boolean;
  onTurn: (action: EncounterTurnOrderAction) => Promise<boolean>;
  onPrepare: () => void;
};
export type TurnOrderRow = EncounterTurnSlot & {
  participant: EncounterParticipant;
  name: string;
  portrait?: string;
  occurrence: number;
  total: number;
};
export type TurnOrderDropTarget = { slotId: string; after: boolean };
