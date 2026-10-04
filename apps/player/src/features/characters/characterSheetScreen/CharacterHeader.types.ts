import type { PlayerCharacterSheet, SheetMode } from './CharacterSheet.types';

export type CharacterHeaderProps = {
  sheet: PlayerCharacterSheet;
  mode: SheetMode;
  onModeChange: (mode: SheetMode) => void;
  onDetails: () => void;
};
