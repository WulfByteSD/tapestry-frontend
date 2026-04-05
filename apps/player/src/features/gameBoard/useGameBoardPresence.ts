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
          if (prev.some((u) => u.playerId === user.playerId)) {
            return prev;
          }
          return [...prev, user];
        });
      },
      onUserLeft: (playerId: string) => {
        setConnectedUsers((prev) => prev.filter((u) => u.playerId !== playerId));
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
    (playerId: string) => {
      return connectedUsers?.some((u) => u.playerId === playerId);
    },
    [connectedUsers]
  );

  return {
    connectedUsers,
    isUserOnline,
    currentUserCount: connectedUsers.length,
  };
}
