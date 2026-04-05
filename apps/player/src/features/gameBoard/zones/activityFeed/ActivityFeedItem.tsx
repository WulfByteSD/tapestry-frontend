'use client';

import type { CampaignActivity } from '@tapestry/types';
import { GazettePost } from './GazettePost';
import { TimelineEvent } from './TimelineEvent';

type Props = {
  activity: CampaignActivity;
  isLast?: boolean;
};

export function ActivityFeedItem({ activity, isLast }: Props) {
  // Gazette-style rendering for notes
  if (activity.activityType === 'sw.note') {
    return <GazettePost activity={activity} />;
  }

  // Timeline-style rendering for all other events
  return <TimelineEvent activity={activity} isLast={isLast} />;
}
