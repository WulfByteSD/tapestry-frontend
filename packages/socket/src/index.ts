// Core exports
export { SocketProvider, useSocket } from './SocketProvider';
export { createSocketConnection } from './createSocketConnection';
export type { TypedSocket } from './createSocketConnection';

// Types
export type { PresenceUser, ServerToClientEvents, ClientToServerEvents, SocketConnectionState, SocketConfig } from './types';

// Event utilities
export * from './events';
