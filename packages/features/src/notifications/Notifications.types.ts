import type { INotification } from '@tapestry/types';

/** App-supplied resolver: return a route string or null (no navigation for this type). */
export type NotificationLinkResolver = (notification: INotification) => string | null;

export interface UseNotificationsOptions {
  refetchInterval?: number;
  pageLimit?: number;
}

export interface UseNotificationsResult {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}
