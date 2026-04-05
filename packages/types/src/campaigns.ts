import { CharacterSheet } from './characters';
import { PlayerType } from './players';

export type CampaignStatus = 'active' | 'archived';
export type CampaignRole = 'sw' | 'co-sw' | 'player' | 'observer';

export type DiscordMode = 'none' | 'webhook' | 'bot';

export interface CampaignMember {
  player: PlayerType; // ref Player
  role: CampaignRole;
  joinedAt?: Date;
  nickname?: string; // campaign-specific display name (optional)
}

export interface CampaignInvite {
  code: string; // short invite code
  role: CampaignRole; // role granted on join
  expiresAt?: Date | null;
  usesRemaining?: number | null; // null = unlimited
  createdAt?: Date;
}

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  _id: string;
  campaign: string; // campaign ID
  player: PlayerType; // player ID
  preferredRole: CampaignRole;
  message?: string;
  status: JoinRequestStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DiscordConfig {
  mode: DiscordMode;

  // Webhook mode (MVP-friendly)
  webhookUrl?: string | null;

  // Bot mode (later)
  guildId?: string | null;
  channelId?: string | null;

  // Formatting / behavior
  postRolls?: boolean;
  postToThread?: boolean;
  messageStyle?: 'compact' | 'detailed';
}

export interface CampaignDisplayConfig {
  // Labels for UI (campaign-level so characters stay canonical)
  aspectFamilies: {
    might: string; // "Might"
    finesse: string; // "Finesse"
    wit: string; // "Wit"
    resolve: string; // "Resolve"
  };
  aspectSub: {
    strength: string; // "Strength"
    presence: string; // "Presence"
    agility: string; // "Agility"
    charm: string; // "Charm"
    instinct: string; // "Instinct"
    knowledge: string; // "Knowledge"
    willpower: string; // "Willpower"
    empathy: string; // "Empathy"
  };
}

export type CampaignType = {
  _id: string;
  name: string;
  status: CampaignStatus;

  owner: string; // ref Player (Storyweaver)
  members: CampaignMember[];
  avatar: string | null;
  discoverable: boolean; // Whether this campaign appears in public listings
  // Optional setting context
  settingKey?: string; // e.g. "woven-realms"
  toneModules: string[]; // e.g. ["dragon-dial", "love-romance-dial"]

  // Enabled sources for content library
  // ex: ["core", "woven-realms", "hb:<campaignId>"]
  sources: string[];

  // Campaign-level display config (labels)
  display: CampaignDisplayConfig;

  // Discord roll routing config
  discord: DiscordConfig;

  // Optional invites
  invites: CampaignInvite[];

  // Meta
  rulesetVersion: number;
  notes?: string;
  tableExpectations?: string;

  createdAt: Date;
  updatedAt: Date;
};

// ========================================
// Campaign Activity Types
// ========================================

export type CampaignActivityType =
  | 'roll.attack'
  | 'roll.custom'
  | 'campaign.member_joined'
  | 'campaign.member_left'
  | 'campaign.character_attached'
  | 'campaign.character_detached'
  | 'sw.note';

export interface CampaignActivity {
  _id: string;
  campaign: string;
  activityType: CampaignActivityType;
  actor: {
    player: PlayerType; // Could be populated PlayerType
    playerNameSnapshot?: string;
    character?: CharacterSheet; // Could be populated CharacterType
    characterNameSnapshot?: string;
  };
  payload: Record<string, any>; // Type varies by activityType
  createdAt: Date;
  updatedAt: Date;
}

export interface PostNoteInput {
  content: string;
}
