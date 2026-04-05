'use client';

import type { CampaignActivity } from '@tapestry/types';
import { formatDistanceToNow } from 'date-fns';
import styles from './TimelineEvent.module.scss';

type Props = {
  activity: CampaignActivity;
  isLast?: boolean;
};

export function TimelineEvent({ activity, isLast }: Props) {
  const displayName = activity.actor.characterNameSnapshot || activity.actor.playerNameSnapshot || 'Unknown';

  const timestamp = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const eventText = getEventText(activity, displayName);

  return (
    <div className={styles.timelineEvent}>
      <div className={styles.timelineDot}>{!isLast && <div className={styles.timelineLine} />}</div>
      <div className={styles.timelineContent}>
        <span className={styles.eventIcon}>{getEventIcon(activity.activityType)}</span>
        <span className={styles.actorName}>{displayName}</span>
        <span> {eventText}</span>
        <span className={styles.timestamp}>· {timestamp}</span>
      </div>
    </div>
  );
}

function getEventIcon(activityType: string): string {
  switch (activityType) {
    case 'roll.attack':
    case 'roll.custom':
      return '🎲';
    case 'campaign.member_joined':
    case 'campaign.member_left':
      return '👥';
    case 'campaign.character_attached':
      return '⚔️';
    case 'campaign.character_detached':
      return '💨';
    default:
      return '·';
  }
}

function getEventText(activity: CampaignActivity, actorName: string): string {
  switch (activity.activityType) {
    case 'roll.attack':
    case 'roll.custom':
      const result = activity.payload.total || activity.payload.result || '?';
      const rollType = activity.activityType === 'roll.attack' ? 'Attack' : 'Custom';
      return `rolled ${result} (${rollType})`;

    case 'campaign.member_joined':
      return 'joined the campaign';

    case 'campaign.member_left':
      return 'left the campaign';

    case 'campaign.character_attached':
      const attachedChar = activity.payload.characterName || 'a character';
      return `brought ${attachedChar} to the party`;

    case 'campaign.character_detached':
      const detachedChar = activity.payload.characterName || 'a character';
      return `removed ${detachedChar} from the party`;

    default:
      return 'performed an action';
  }
}
