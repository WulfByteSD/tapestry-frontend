import type { AspectSelection, PlayerCharacterSheet, SheetAction, SheetMode, TabKey } from './CharacterSheet.types';
export type CharacterAspectsProps = { sheet: PlayerCharacterSheet; mode: SheetMode; onApproach: (aspect: AspectSelection) => void };
export type CharacterResourcesProps = { sheet: PlayerCharacterSheet; onAction: (action: SheetAction) => void; onNavigate: (tab: TabKey) => void };
export type CharacterPlayModalsProps = { sheet: PlayerCharacterSheet; action: SheetAction | null; aspect: AspectSelection | null; onClose: () => void };
