'use client';

import React, { useEffect, useRef } from 'react';
import { Loader, Button } from '@tapestry/ui';
import type { NotificationLinkResolver, UseNotificationsResult } from '../Notifications.types';
import { NotificationItem } from '../components/NotificationItem/NotificationItem';
import styles from './NotificationsView.module.scss';

interface NotificationsViewProps extends UseNotificationsResult {
  getLink: NotificationLinkResolver;
}

export function NotificationsView({
  notifications,
  unreadCount,
  isLoading,
  isError,
  markRead,
  markAllRead,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  getLink,
}: NotificationsViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className={styles.center}>
          <Loader />
        </div>
      )}

      {isError && !isLoading && (
        <div className={styles.center}>
          <p className={styles.errorText}>Failed to load notifications. Please try again.</p>
        </div>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <div className={styles.center}>
          <p className={styles.emptyText}>You&apos;re all caught up. No notifications yet.</p>
        </div>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className={styles.list}>
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} getLink={getLink} onMarkRead={markRead} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />

          {isFetchingNextPage && (
            <div className={styles.center}>
              <Loader />
            </div>
          )}

          {!hasNextPage && notifications.length > 0 && <p className={styles.endOfList}>You&apos;ve reached the end.</p>}
        </div>
      )}
    </div>
  );
}
