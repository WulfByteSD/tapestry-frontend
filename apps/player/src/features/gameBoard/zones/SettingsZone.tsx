'use client';

import { useState } from 'react';
import { Card } from '@tapestry/ui';
import type { CampaignType } from '@tapestry/types';
import DeleteCampaignModal from './settings/DeleteCampaignModal';
import FullDeleteCampaignModal from './settings/FullDeleteCampaignModal';
import styles from './zones.module.scss';

type Props = {
  campaign: CampaignType & { _id: string };
  isSW: boolean;
  isArchived: boolean;
};

export default function SettingsZone({ campaign, isSW, isArchived }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFullDeleteModal, setShowFullDeleteModal] = useState(false);

  if (!isSW) {
    return (
      <div className={styles.zone}>
        <div className={styles.zoneHeader}>
          <h2 className={styles.zoneTitle}>Settings</h2>
        </div>
        <p className={styles.zoneDescription}>Only Storyweavers can access campaign settings.</p>
      </div>
    );
  }

  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Campaign Settings</h2>
      </div>

      <div className={styles.settingsGrid}>
        {/* Discord Integration - Placeholder for later */}
        <Card>
          <h3 className={styles.settingTitle}>Discord Integration</h3>
          <p className={styles.settingDescription}>Connect your campaign to a Discord server or channel to sync activity, rolls, and notifications.</p>
          <p className={styles.comingSoon}>
            <em>Coming soon</em>
          </p>
        </Card>

        {/* Danger Zone */}
        <Card>
          <div className={styles.dangerActions}>
            <div className={styles.dangerAction}>
              <div>
                <h4 className={styles.dangerActionTitle}>Archive Campaign</h4>
                <p className={styles.dangerActionDescription}>Preserve campaign data but mark it as inactive. Can be useful for completed campaigns.</p>
              </div>
              <button className={styles.warningButton} onClick={() => setShowDeleteModal(true)} disabled={isArchived}>
                {isArchived ? 'Already Archived' : 'Archive'}
              </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.dangerAction}>
              <div>
                <h4 className={styles.dangerActionTitle}>Delete Campaign Forever</h4>
                <p className={styles.dangerActionDescription}>Permanently destroy all campaign data. This cannot be undone. Use for test campaigns only.</p>
              </div>
              <button className={styles.dangerButton} onClick={() => setShowFullDeleteModal(true)}>
                Delete Forever
              </button>
            </div>
          </div>
        </Card>
      </div>

      <DeleteCampaignModal open={showDeleteModal} campaign={campaign} onClose={() => setShowDeleteModal(false)} />

      <FullDeleteCampaignModal open={showFullDeleteModal} campaign={campaign} onClose={() => setShowFullDeleteModal(false)} />
    </div>
  );
}
