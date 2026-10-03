import type { AspectGroup, AspectKey, CharacterSheet, NoteCard } from '@tapestry/types';

export type SheetMode = 'build' | 'play';
export type TabKey = 'overview' | 'rolls' | 'abilities' | 'skills' | 'inventory' | 'conditions' | 'notes' | 'export';
export type SheetAction = 'approach' | 'attack' | 'hp' | 'threads' | 'harm';
// The character API includes dtn; the shared client type has not caught up yet.
export type PlayerCharacterSheet = CharacterSheet & { sheet: CharacterSheet['sheet'] & { dtn?: number } };
export type CharacterSheetScreenProps = { characterId: string; mode: SheetMode };
export type AspectSelection = { group: AspectGroup; key: AspectKey; label: string; blockTitle: string };
export type SheetTabsProps = {
  sheet: PlayerCharacterSheet;
  mode: SheetMode;
  onSaveNotes: (notes: NoteCard[]) => void;
  onAction: (action: SheetAction) => void;
  onNavigate: (tab: TabKey) => void;
};
