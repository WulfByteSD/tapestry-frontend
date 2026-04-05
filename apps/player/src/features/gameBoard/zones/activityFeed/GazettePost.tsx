'use client';

import { useState } from 'react';
import { Avatar, Card, CardBody, Modal } from '@tapestry/ui';
import type { CampaignActivity } from '@tapestry/types';
import { formatDistanceToNow } from 'date-fns';
import styles from './GazettePost.module.scss';

type Props = {
  activity: CampaignActivity;
};

export function GazettePost({ activity }: Props) {
  const [showFullModal, setShowFullModal] = useState(false);
  const displayName = activity.actor.characterNameSnapshot || activity.actor.playerNameSnapshot || 'Unknown';

  const timestamp = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const content = activity.payload.content || '';
  const needsTruncation = content.length > 300;
  const displayContent = needsTruncation ? content.slice(0, 300) + '...' : content;

  return (
    <>
      <div className={styles.gazettePost}>
        <div className={styles.gazetteHeader}>
          <Avatar className={styles.gazetteAvatar} size="md" src={activity.actor.player?.avatar} name={displayName} alt={displayName} />
          <div className={styles.gazetteMeta}>
            <div className={styles.gazetteName}>{displayName}</div>
            <div className={styles.gazetteRole}>Storyweaver · {timestamp}</div>
          </div>
        </div>

        <Card tone="surface" inlay className={styles.gazetteCard}>
          <CardBody>
            <div className={styles.gazetteLabel}>
              <span>📰</span>
              <span>Campaign Update</span>
            </div>
            <div className={styles.gazetteContent}>{displayContent}</div>
            {needsTruncation && (
              <button className={styles.readMoreButton} onClick={() => setShowFullModal(true)}>
                Read Full Post →
              </button>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={showFullModal}
        onCancel={() => setShowFullModal(false)}
        title={
          <div>
            <div style={{ fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{timestamp}</div>
          </div>
        }
      >
        <div className={styles.modalContent}>{content}</div>
      </Modal>
    </>
  );
}
