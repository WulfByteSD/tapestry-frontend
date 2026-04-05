'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@tapestry/socket';
import { joinGameBoardRoom, leaveGameBoardRoom, subscribeToPresence, type PresenceUser } from '@tapestry/socket';

export function useGameBoardPresence(campaignId?: string) {
  const { socket, state } = useSocket();
  const [connectedUsers, setConnectedUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!socket || !campaignId || state !== 'connected') {
      setConnectedUsers([]);
      return;
    }

    // Join the game board room
    joinGameBoardRoom(socket, campaignId);

    // Subscribe to presence events
    const cleanup = subscribeToPresence(socket, campaignId, {
      onUserJoined: (user: PresenceUser) => {
        setConnectedUsers((prev) => {
          // Avoid duplicates
          if (prev.some((u) => u.userId === user.userId)) {
            return prev;
          }
          return [...prev, user];
        });
      },
      onUserLeft: (userId: string) => {
        setConnectedUsers((prev) => prev.filter((u) => u.userId !== userId));
      },
      onRoomState: (users: PresenceUser[]) => {
        setConnectedUsers(users);
      },
    });

    // Cleanup: leave room and unsubscribe
    return () => {
      cleanup();
      leaveGameBoardRoom(socket, campaignId);
      setConnectedUsers([]);
    };
  }, [socket, campaignId, state]);

  const isUserOnline = useCallback(
    (userId: string) => {
      return connectedUsers?.some((u) => u.userId === userId);
    },
    [connectedUsers]
  );

  return {
    connectedUsers,
    isUserOnline,
    currentUserCount: connectedUsers.length,
  };
}
