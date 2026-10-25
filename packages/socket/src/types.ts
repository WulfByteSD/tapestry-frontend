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
  // Chat payloads are transport notifications; consumers reconcile through authorized HTTP reads.
  'chat:message:created': (data: { campaignId: string; channelId: string; message: unknown }) => void;
  'chat:message:updated': (data: { campaignId: string; channelId: string; message: unknown }) => void;
  'chat:message:deleted': (data: { campaignId: string; channelId: string; message: unknown }) => void;
  'chat:channel:updated': (data: { campaignId: string; channelId: string }) => void;
  'chat:unread:updated': (data: { campaignId: string; channelId: string; unreadCount: number; lastReadMessageId: string | null }) => void;
  'chat:access:changed': (data: { campaignId: string; channelIds: string[]; reason: 'channel_membership_changed' | 'campaign_member_removed' | 'member_role_changed' | 'campaign_member_joined' | 'campaign_deleted' }) => void;
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
