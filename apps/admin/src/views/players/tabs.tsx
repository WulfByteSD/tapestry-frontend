import type { TabsItem } from '@tapestry/ui';
import { PlayerProfileSection } from './sections/playerProfile';
import { AccountAuthSection } from './sections/accountAuth';
import { CharactersSection } from './sections/characters';
import { CampaignsSection } from './sections/CampaignsSection';

export type TabKey = 'profile' | 'account' | 'characters' | 'campaigns';

export function createTabs(playerId: string): TabsItem[] {
  return [
    {
      key: 'profile',
      label: 'Profile',
      icon: undefined,
      children: <PlayerProfileSection playerId={playerId} />,
    },
    {
      key: 'account',
      label: 'Account & Auth',
      icon: undefined,
      children: <AccountAuthSection playerId={playerId} />,
    },
    {
      key: 'characters',
      label: 'Characters',
      icon: undefined,
      children: <CharactersSection playerId={playerId} />,
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      icon: undefined,
      children: <CampaignsSection playerId={playerId} />,
    },
  ];
}
