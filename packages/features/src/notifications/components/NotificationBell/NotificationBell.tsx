'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { INotification } from '@tapestry/types';
import type { NotificationLinkResolver } from '../../Notifications.types';
import { NotificationItem } from '../NotificationItem/NotificationItem';
import styles from './NotificationBell.module.scss';

interface NotificationBellProps {
  notifications: INotification[];
  unreadCount: number;
  getLink: NotificationLinkResolver;
  onMarkRead: (id: string) => void;
  viewAllHref?: string;
}

function BellIcon() {
  return (
    <svg className={styles.bellIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NotificationBell({ notifications, unreadCount, getLink, onMarkRead, viewAllHref = '/notifications' }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const preview = notifications.slice(0, 3);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={toggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown} role="dialog" aria-label="Notifications panel">
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && <span className={styles.unreadBadge}>{unreadCount} unread</span>}
          </div>

          {preview.length === 0 ? (
            <p className={styles.empty}>No notifications yet.</p>
          ) : (
            <div className={styles.list}>
              {preview.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  getLink={getLink}
                  onMarkRead={(id) => {
                    onMarkRead(id);
                    setOpen(false);
                  }}
                  compact
                />
              ))}
            </div>
          )}

          <a href={viewAllHref} className={styles.viewAll} onClick={() => setOpen(false)}>
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
