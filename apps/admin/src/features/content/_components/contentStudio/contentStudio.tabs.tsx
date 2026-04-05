import type { TabsItem } from '@tapestry/ui';
import type { StudioSettingSummary } from '../../_hooks/useContentStudio';

import ItemsView from '@/views/content/items/ItemsView.component';
import LoreView from '../../views/LoreView.component';
import AbilitiesView from '@/views/content/abilities/AbilitiesView.component';
import SkillsView from '@/views/content/skills/SkillsView.component';

type TabKey = 'lore' | 'items' | 'abilities' | 'skills';

export type { TabKey };

export function createStudioTabs(props: { activeTab: TabKey; selectedSetting: StudioSettingSummary | null }): TabsItem[] {
  const { activeTab, selectedSetting } = props;

  return [
    {
      key: 'lore',
      label: 'Lore',
      children: activeTab === 'lore' ? <LoreView selectedSetting={selectedSetting} /> : <div style={{ minHeight: 640 }} />,
    },
    {
      key: 'items',
      label: 'Items',
      children: activeTab === 'items' ? <ItemsView selectedSetting={selectedSetting as any} /> : <div style={{ minHeight: 640 }} />,
    },
    {
      key: 'abilities',
      label: 'Abilities',
      children: activeTab === 'abilities' ? <AbilitiesView selectedSetting={selectedSetting as any} /> : <div style={{ minHeight: 640 }} />,
    },
    {
      key: 'skills',
      label: 'Skills',
      children: activeTab === 'skills' ? <SkillsView selectedSetting={selectedSetting as any} /> : <div style={{ minHeight: 640 }} />,
    },
  ];
}
