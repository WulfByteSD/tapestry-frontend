'use client';

import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { INotification } from '@tapestry/types';
import type { NotificationLinkResolver } from '../../Notifications.types';
import styles from './NotificationItem.module.scss';
import Link from 'next/link';

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: INotification;
  getLink: NotificationLinkResolver;
  onMarkRead: (id: string) => void;
  compact?: boolean;
}

function SenderAvatar({ notification }: { notification: INotification }) {
  if (!notification.userFrom) {
    return (
      <div className={styles.avatarSystem} aria-label="Free Agent Portal">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="var(--ui-accent)" />
          <path d="M12 6l4 8H8l4-8z" fill="white" />
        </svg>
      </div>
    );
  }

  const { profileImageUrl, firstName, lastName } = notification.userFrom;

  if (profileImageUrl) {
    return <img className={styles.avatarImg} src={profileImageUrl} alt={[firstName, lastName].filter(Boolean).join(' ') || 'User'} />;
  }

  const initials = [firstName?.[0], lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?';
  return <div className={styles.avatarFallback}>{initials}</div>;
}

export function NotificationItem({ notification, getLink, onMarkRead, compact }: NotificationItemProps) {
  const link = getLink(notification);
  const isUnread = !notification.opened;

  const senderName = notification.userFrom
    ? [notification.userFrom.firstName, notification.userFrom.lastName].filter(Boolean).join(' ') || notification.userFrom.email || 'User'
    : 'Free Agent Portal';

  const timestamp = dayjs(notification.createdAt).fromNow();

  const content = (
    <>
      <SenderAvatar notification={notification} />
      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.sender}>{senderName}</span>
          <span className={styles.time}>{timestamp}</span>
        </div>
        <p className={styles.message}>{notification.message}</p>
        {!compact && notification.description && <p className={styles.description}>{notification.description}</p>}
      </div>
      {isUnread && <span className={styles.unreadDot} aria-label="Unread" />}
    </>
  );

  const className = [styles.item, isUnread ? styles.unread : '', compact ? styles.compact : ''].filter(Boolean).join(' ');

  if (link) {
    return (
      <Link
        href={link}
        className={className}
        onClick={() => {
          if (isUnread) onMarkRead(notification._id);
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={className}
      onClick={() => {
        if (isUnread) onMarkRead(notification._id);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (isUnread) onMarkRead(notification._id);
        }
      }}
    >
      {content}
    </div>
  );
}
