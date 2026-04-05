// WebSocket event type definitions

export type PresenceUser = {
  userId: string;
  playerId: string;
  displayName: string;
  avatar?: string;
  connectedAt: string;
};

// Server → Client events
export type ServerToClientEvents = {
  'presence:user-joined': (data: { userId: string; playerId: string; campaignId: string; displayName: string; avatar?: string }) => void;
  'presence:user-left': (data: { userId: string; playerId: string; campaignId: string }) => void;
  'presence:room-state': (data: { campaignId: string; users: PresenceUser[] }) => void;
  // Future events
  'activity:new-post': (data: { campaignId: string; activity: any }) => void;
  'campaign:updated': (data: { campaignId: string; changes: any }) => void;
};

// Client → Server events
export type ClientToServerEvents = {
  'presence:join-room': (campaignId: string) => void;
  'presence:leave-room': (campaignId: string) => void;
};

export type SocketConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export type SocketConfig = {
  apiOrigin: string;
  token?: string;
  debug?: boolean;
};
