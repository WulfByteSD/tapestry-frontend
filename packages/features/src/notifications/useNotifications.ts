'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AxiosInstance } from 'axios';
import type { INotification } from '@tapestry/types';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@tapestry/api-client';
import type { UseNotificationsOptions, UseNotificationsResult } from './Notifications.types';

const DEFAULT_REFETCH_INTERVAL = 60_000;
const DEFAULT_PAGE_LIMIT = 20;

/** Minimal auth shape required by useNotifications */
type AuthLike = {
  _id: string;
  profileRefs?: Record<string, string | null>;
};

function deriveUserIds(auth: AuthLike): string[] {
  const ids: string[] = [auth._id];
  for (const id of Object.values(auth.profileRefs ?? {})) {
    if (id) ids.push(id);
  }
  return ids;
}

export function useNotifications(api: AxiosInstance, auth: AuthLike | undefined, options?: UseNotificationsOptions): UseNotificationsResult {
  const queryClient = useQueryClient();
  const refetchInterval = options?.refetchInterval ?? DEFAULT_REFETCH_INTERVAL;
  const pageLimit = options?.pageLimit ?? DEFAULT_PAGE_LIMIT;

  const userIds = useMemo(() => (auth ? deriveUserIds(auth) : []), [auth]);
  const enabled = userIds.length > 0;

  const query = useInfiniteQuery({
    queryKey: ['notifications', userIds],
    queryFn: ({ pageParam }) => fetchNotifications(api, userIds, { page: pageParam as number, limit: pageLimit }),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const loadedCount = (lastPage.metadata?.page ?? (lastPageParam as number)) * pageLimit;
      const total = lastPage.metadata?.totalCount;
      if (total !== undefined) {
        return loadedCount < total ? (lastPageParam as number) + 1 : undefined;
      }
      // Fallback: if the page was full, assume there may be more
      return lastPage.payload.length === pageLimit ? (lastPageParam as number) + 1 : undefined;
    },
    initialPageParam: 1,
    refetchInterval,
    enabled,
  });

  const notifications: INotification[] = useMemo(() => query.data?.pages.flatMap((p) => p.payload) ?? [], [query.data]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.opened).length, [notifications]);

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead(api, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(api),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAll.mutate(),
    fetchNextPage: () => query.fetchNextPage(),
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
