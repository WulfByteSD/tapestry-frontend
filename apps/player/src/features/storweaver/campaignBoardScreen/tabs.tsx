import type { TabsItem } from '@tapestry/ui';
import { motion } from 'framer-motion';
import { OverviewTab } from './tabs/overview';
import { RosterTab } from './tabs/roster';
import { InvitesTab } from './tabs/invites';
import { CharactersTab } from './tabs/characters';
import type { CampaignType, SettingDefinition } from '@tapestry/types';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { ApiListResponse } from '@tapestry/api-client/src/list/list.types';
import RequestToJoin from './tabs/requests/RequestToJoin.component';

type TabKey = 'overview' | 'roster' | 'invites' | 'characters' | 'requests';

export type { TabKey };

type CreateTabsProps = {
  campaign: CampaignType & { _id: string };
  updateMutation: UseMutationResult<any, any, any, any>;
  settingsQuery: UseQueryResult<ApiListResponse<SettingDefinition>, Error>;
  userRole: 'owner' | 'sw' | 'co-sw' | 'player' | 'observer' | null;
};

export function createTabs(props: CreateTabsProps): TabsItem[] {
  const { campaign, updateMutation, settingsQuery, userRole } = props;

  const isArchived = campaign.status === 'archived';
  const canSeeInvites = userRole === 'owner' || userRole === 'sw' || userRole === 'co-sw';

  const tabs: TabsItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      icon: undefined,
      children: (
        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
          <OverviewTab campaign={campaign} updateMutation={updateMutation} settingsQuery={settingsQuery} isArchived={isArchived} />
        </motion.div>
      ),
    },
    {
      key: 'roster',
      label: 'Roster',
      icon: undefined,
      children: (
        <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
          <RosterTab campaign={campaign} isArchived={isArchived} />
        </motion.div>
      ),
    },
    {
      key: 'requests',
      label: 'Join Requests',
      icon: undefined,
      children: (
        <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
          <RequestToJoin campaign={campaign} isArchived={isArchived} />
        </motion.div>
      ),
    },
  ];

  // Only show Invites tab to owner, SW, and co-SW
  if (canSeeInvites) {
    tabs.push({
      key: 'invites',
      label: 'Invites',
      icon: undefined,
      children: (
        <motion.div key="invites" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
          <InvitesTab campaign={campaign} />
        </motion.div>
      ),
    });
  }

  tabs.push({
    key: 'characters',
    label: 'Characters',
    icon: undefined,
    children: (
      <motion.div key="characters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
        <CharactersTab campaign={campaign} />
      </motion.div>
    ),
  });

  return tabs;
}
