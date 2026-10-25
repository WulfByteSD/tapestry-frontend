'use client';

import { RollHistory } from '../rollHistory/RollHistory.component';
import type { RollHistoryProps } from '../rollHistory/RollHistory.types';

export default function RollsZone(props: RollHistoryProps) {
  return <RollHistory key={`${props.campaignId}:${props.currentUserId}`} {...props} />;
}
