'use client';

import { useState } from 'react';
import { Avatar, Card, CardBody, Modal } from '@tapestry/ui';
import type { CampaignActivity, NotePostType } from '@tapestry/types';
import { formatDistanceToNow } from 'date-fns';
import { MarkdownContent } from './MarkdownContent';
import styles from './GazettePost.module.scss';

type Props = {
  activity: CampaignActivity;
};

function getPostTypeDisplay(postType: NotePostType): { icon: string; label: string } {
  switch (postType) {
    case 'campaign-update':
      return { icon: '📰', label: 'Campaign Update' };
    case 'session-recap':
      return { icon: '⚔️', label: 'Session Recap' };
    case 'lore-drop':
      return { icon: '📜', label: 'Lore Drop' };
    case 'player-spotlight':
      return { icon: '⭐', label: 'Player Spotlight' };
    case 'announcement':
      return { icon: '📢', label: 'Announcement' };
    case 'behind-the-scenes':
      return { icon: '🎬', label: 'Behind the Scenes' };
    default:
      return { icon: '📰', label: 'Campaign Update' };
  }
}

export function GazettePost({ activity }: Props) {
  const [showFullModal, setShowFullModal] = useState(false);
  const displayName = activity.actor.characterNameSnapshot || activity.actor.playerNameSnapshot || 'Unknown';

  const timestamp = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  const content = activity.payload.content || '';
  const postType = (activity.payload.postType || 'campaign-update') as NotePostType;
  const { icon, label } = getPostTypeDisplay(postType);

  const needsTruncation = content.length > 300;
  const truncatedContent = needsTruncation ? content.slice(0, 300) + '...' : content;

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
              <span>{icon}</span>
              <span>{label}</span>
            </div>
            <div className={styles.gazetteContent}>
              <MarkdownContent content={truncatedContent} />
            </div>
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
        <div className={styles.modalContent}>
          <MarkdownContent content={content} />
        </div>
      </Modal>
    </>
  );
}
