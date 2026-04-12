import type { TabsItem } from '@tapestry/ui';
import { OverviewTab } from './tabs/overview/OverviewTab';
import { NotesTab } from './tabs/notes/NotesTab';
import { RollsTab } from './tabs/rolls/RollsTab';
import { PlaceholderTab } from './tabs/PlaceholderTab';
import { InventoryTab } from './tabs/inventory/Inventory.tab';
import { SkillsTab } from './tabs/skills/Skills.tab';
import { ConditionsTab } from './tabs/conditions/Conditions.tab';
import { AbilitiesTab } from './tabs/abilities/Abilities.tab';
import { ExportTab } from './tabs/export/ExportTab';

type TabKey = 'overview' | 'rolls' | 'abilities' | 'skills' | 'inventory' | 'conditions' | 'notes' | 'export';

export type { TabKey };

export function createTabs(props: { sheet: any; onSaveNotes: (noteCards: any[]) => void; mode: 'build' | 'play' }): TabsItem[] {
  const { sheet, onSaveNotes, mode } = props;

  return [
    {
      key: 'overview',
      label: 'Overview',
      icon: undefined,
      children: <OverviewTab sheet={sheet} mode={mode} />,
    },
    {
      key: 'rolls',
      label: 'Rolls',
      icon: undefined,
      children: <RollsTab sheet={sheet} />,
    },
    {
      key: 'abilities',
      label: 'Abilities',
      icon: undefined,
      children: <AbilitiesTab sheet={sheet} mode={mode} />,
    },
    {
      key: 'skills',
      label: 'Skills',
      icon: undefined,
      children: <SkillsTab sheet={sheet} mode={mode} />,
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: undefined,
      children: <InventoryTab sheet={sheet} mode={mode} />,
    },
    {
      key: 'conditions',
      label: 'Conditions',
      icon: undefined,
      children: <ConditionsTab sheet={sheet} mode={mode} />,
    },
    {
      key: 'notes',
      label: 'Notes',
      icon: undefined,
      children: <NotesTab initialNoteCards={sheet?.sheet?.noteCards ?? []} onSave={onSaveNotes} />,
    },
    {
      key: 'export',
      label: 'Export',
      icon: undefined,
      children: <ExportTab sheet={sheet} />,
    },
  ];
}
