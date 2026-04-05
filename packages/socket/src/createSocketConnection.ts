import { io, Socket } from 'socket.io-client';
import type { SocketConfig, ServerToClientEvents, ClientToServerEvents } from './types';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocketConnection(config: SocketConfig): TypedSocket {
  const { apiOrigin, token, debug = false } = config;

  // Remove /api/v1 suffix if present to get base origin
  const baseOrigin = apiOrigin.replace(/\/api\/v1\/?$/, '');

  if (debug) {
    console.log('[Socket] Connecting to:', baseOrigin);
  }

  const socket: TypedSocket = io(baseOrigin, {
    auth: {
      token: token || '',
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // Debug logging
  if (debug) {
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    // Use socket.io for reconnection tracking to avoid type issues
    socket.io.on('reconnect_attempt', (attempt: number) => {
      console.log('[Socket] Reconnection attempt:', attempt);
    });
  }

  return socket;
}
