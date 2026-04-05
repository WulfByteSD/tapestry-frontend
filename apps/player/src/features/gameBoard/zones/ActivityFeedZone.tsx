'use client';

import { useRef, useEffect, useState } from 'react';
import { useCampaignActivityFeed } from './activityFeed/activityFeed.hooks';
import { Loader } from '@tapestry/ui';
import { ActivityFeedItem } from './activityFeed/ActivityFeedItem';
import { PostNoteModal } from './activityFeed/PostNoteModal';
import styles from './zones.module.scss';

type Props = {
  campaignId: string;
  isSW: boolean;
};

export default function ActivityFeedZone({ campaignId, isSW }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCampaignActivityFeed(campaignId);

  const allActivities = data?.pages.flatMap((page) => page.payload) || [];

  // Auto-scroll to bottom on first load
  useEffect(() => {
    if (scrollRef.current && data?.pages.length === 1) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.pages.length]);

  // Auto-fetch more content if container isn't scrollable but has more pages
  useEffect(() => {
    if (!scrollRef.current || isFetchingNextPage || !hasNextPage || isLoading) return;

    const container = scrollRef.current;
    const isScrollable = container.scrollHeight > container.clientHeight;

    if (!isScrollable) {
      fetchNextPage();
    }
  }, [allActivities.length, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Detect scroll to top -> load more
  const handleScroll = () => {
    if (!scrollRef.current || isFetchingNextPage || !hasNextPage) return;

    if (scrollRef.current.scrollTop < 100) {
      fetchNextPage();
    }
  };

  return (
    <div className={styles.zone}>
      <div className={styles.zoneHeader}>
        <h2 className={styles.zoneTitle}>Activity Feed</h2>
        {isSW && (
          <button className={styles.actionButton} onClick={() => setShowPostModal(true)}>
            + Create Post
          </button>
        )}
      </div>

      <div ref={scrollRef} className={styles.feedScroll} onScroll={handleScroll}>
        {isFetchingNextPage && (
          <div className={styles.loadMoreIndicator}>
            <Loader size="sm" label="Loading older activities" />
          </div>
        )}

        {isLoading ? (
          <Loader label="Loading activity feed" />
        ) : allActivities.length === 0 ? (
          <p className={styles.emptyState}>No activity yet. Rolls, character actions, and story updates will appear here.</p>
        ) : (
          <div className={styles.feedList}>
            {allActivities.map((activity, index) => (
              <ActivityFeedItem key={activity._id} activity={activity} isLast={index === allActivities.length - 1} />
            ))}
          </div>
        )}
      </div>

      <PostNoteModal campaignId={campaignId} isOpen={showPostModal} onClose={() => setShowPostModal(false)} />
    </div>
  );
}
