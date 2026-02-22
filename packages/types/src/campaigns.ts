export type CampaignStatus = "active" | "archived";
export type CampaignRole = "sw" | "co-sw" | "player" | "observer";

export type DiscordMode = "none" | "webhook" | "bot";

export interface CampaignMember {
  player: string; // ref Player
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
  messageStyle?: "compact" | "detailed";
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
  name: string;
  status: CampaignStatus;

  owner: string; // ref Player (Storyweaver)
  members: CampaignMember[];

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

  createdAt: Date;
  updatedAt: Date;
}
