import { BiHome, BiFile, BiCog } from 'react-icons/bi';
import { GiDiceTarget } from 'react-icons/gi';
import { FiCompass } from 'react-icons/fi';
import type { SidebarGroup } from '@tapestry/ui';
import type { PlayerType, CampaignType } from '@tapestry/types';

interface NavigationLinksProps {
  profile?: PlayerType | null;
  campaigns?: CampaignType[];
}

/**
 * Generates navigation links for both desktop sidebar and mobile bottom nav.
 *
 * Desktop: Displays all links in sidebar
 * Mobile: Filters out links with hideOnMobile=true, campaigns accessible via account drawer
 *
 * @param profile - Current player profile
 * @param campaigns - User's campaigns
 * @returns Grouped navigation links
 */
export function getNavigationLinks({ profile, campaigns = [] }: NavigationLinksProps): SidebarGroup[] {
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
          hideOnMobile: true, // Campaigns accessible via account drawer on mobile
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
        { href: storyweaverHref, label: 'Storyweaver', icon: <BiFile />, hideOnMobile: true },
      ],
    },
  ];

  // Insert campaigns group before Account section
  groups.push(campaignsGroup);

  groups.push({
    title: 'Account',
    links: [{ href: '/settings', label: 'Settings', icon: <BiCog />, hideOnMobile: true }],
  });

  return groups;
}

// Backward compatibility export
export const getSidebarLinks = getNavigationLinks;
