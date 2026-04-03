'use client';

import { Card, CardBody, CardHeader } from '@tapestry/ui';
import { usePlayerCampaigns } from '@/lib/player-admin';
import styles from '../PlayerDetailView.module.scss';

type CampaignsSectionProps = {
  playerId: string;
};

export function CampaignsSection({ playerId }: CampaignsSectionProps) {
  const { data: campaignsData } = usePlayerCampaigns(playerId, {
    filterOptions: `members;{"$in":"${playerId}"}`,
  });

  const campaigns = campaignsData?.payload ?? [];

  return (
    <Card className={styles.resourcesCard}>
      <CardHeader>
        <h2>Campaigns ({campaigns.length})</h2>
      </CardHeader>
      <CardBody>
        {campaigns.length === 0 ? (
          <p className={styles.emptyMessage}>Not participating in any campaigns.</p>
        ) : (
          <ul className={styles.resourceList}>
            {campaigns.map((campaign: any) => (
              <li key={campaign._id} className={styles.resourceItem}>
                <span className={styles.resourceName}>{campaign.name || 'Unnamed Campaign'}</span>
                <code className={styles.resourceId}>{campaign._id}</code>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
