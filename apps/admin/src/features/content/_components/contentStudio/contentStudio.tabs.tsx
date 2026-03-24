import type { TabsItem } from '@tapestry/ui';
import type { StudioSettingSummary } from '../../_hooks/useContentStudio';

import LoreView from '@/features/content/views/LoreView.component';
import ItemsView from '@/features/content/views/ItemsView.component';
import AbilitiesView from '@/features/content/views/AbilitiesView.component';
import SkillsView from '@/features/content/views/SkillsView.component';

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
      children: activeTab === 'abilities' ? <AbilitiesView selectedSetting={selectedSetting} /> : <div style={{ minHeight: 640 }} />,
    },
    {
      key: 'skills',
      label: 'Skills',
      children: activeTab === 'skills' ? <SkillsView selectedSetting={selectedSetting} /> : <div style={{ minHeight: 640 }} />,
    },
  ];
}
