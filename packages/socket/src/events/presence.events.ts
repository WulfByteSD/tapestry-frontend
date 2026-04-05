import type { TypedSocket } from '../createSocketConnection';
import type { PresenceUser } from '../types';

export type PresenceEventHandlers = {
  onUserJoined?: (user: PresenceUser) => void;
  onUserLeft?: (playerId: string) => void;
  onRoomState?: (users: PresenceUser[]) => void;
};

/**
 * Join a game board room to receive presence updates
 */
export function joinGameBoardRoom(socket: TypedSocket, campaignId: string): void {
  socket.emit('presence:join-room', campaignId);
}

/**
 * Leave a game board room
 */
export function leaveGameBoardRoom(socket: TypedSocket, campaignId: string): void {
  socket.emit('presence:leave-room', campaignId);
}

/**
 * Subscribe to presence events for a campaign
 * Returns cleanup function to remove listeners
 */
export function subscribeToPresence(socket: TypedSocket, campaignId: string, handlers: PresenceEventHandlers): () => void {
  const { onUserJoined, onUserLeft, onRoomState } = handlers;

  // User joined handler
  const handleUserJoined = (data: { userId: string; playerId: string; campaignId: string; displayName: string; avatar?: string }) => {
    if (data.campaignId !== campaignId) return;

    if (onUserJoined) {
      onUserJoined({
        userId: data.userId,
        playerId: data.playerId,
        displayName: data.displayName,
        avatar: data.avatar,
        connectedAt: new Date().toISOString(),
      });
    }
  };

  // User left handler
  const handleUserLeft = (data: { userId: string; playerId: string; campaignId: string }) => {
    if (data.campaignId !== campaignId) return;
    if (onUserLeft) {
      onUserLeft(data.playerId);
    }
  };

  // Room state handler
  const handleRoomState = (data: { campaignId: string; users: PresenceUser[] }) => {
    if (data.campaignId !== campaignId) return;
    if (onRoomState) {
      onRoomState(data.users);
    }
  };

  // Attach listeners
  socket.on('presence:user-joined', handleUserJoined);
  socket.on('presence:user-left', handleUserLeft);
  socket.on('presence:room-state', handleRoomState);

  // Return cleanup function
  return () => {
    socket.off('presence:user-joined', handleUserJoined);
    socket.off('presence:user-left', handleUserLeft);
    socket.off('presence:room-state', handleRoomState);
  };
}
