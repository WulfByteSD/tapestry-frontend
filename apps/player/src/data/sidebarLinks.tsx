import { BiHome, BiFile, BiCog } from 'react-icons/bi';
import { GiDiceTarget } from 'react-icons/gi';
import { FiCompass } from 'react-icons/fi';
import type { SidebarGroup } from '@tapestry/ui';
import type { PlayerType, CampaignType } from '@tapestry/types';

interface SidebarLinksProps {
  profile?: PlayerType | null;
  campaigns?: CampaignType[];
}

export function getSidebarLinks({ profile, campaigns = [] }: SidebarLinksProps): SidebarGroup[] {
  // Check if user has storyweaver role
  const hasStoryweaverRole = profile?.roles?.includes('storyweaver') ?? false;
  const storyweaverHref = hasStoryweaverRole ? '/storyweaver/campaigns' : '/storyweaver/become';

  // Build campaigns group from user's active campaigns
  const activeCampaigns = campaigns;

  const campaignLinks =
    activeCampaigns.length > 0
      ? activeCampaigns.map((campaign) => ({
          href: `/games/${campaign._id}/board`,
          label: campaign.name,
          icon: <FiCompass />,
        }))
      : [
          {
            href: '/games',
            label: 'Browse Games',
            icon: <GiDiceTarget />,
          },
        ];

  const campaignsGroup: SidebarGroup = {
    title: 'Campaigns',
    links: campaignLinks,
  };

  const groups: SidebarGroup[] = [
    {
      title: 'Main',
      links: [{ href: '/', label: 'Home', icon: <BiHome /> }],
    },
    {
      title: 'Gameplay',
      links: [
        { href: '/games', label: 'Games', icon: <GiDiceTarget /> },
        { href: storyweaverHref, label: 'Storyweaver', icon: <BiFile /> },
      ],
    },
  ];

  // Insert campaigns group before Account section
  groups.push(campaignsGroup);

  groups.push({
    title: 'Account',
    links: [{ href: '/settings', label: 'Settings', icon: <BiCog /> }],
  });

  return groups;
}
