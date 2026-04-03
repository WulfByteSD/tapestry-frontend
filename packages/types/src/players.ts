export interface PlayerType {
  _id: string;
  user: string;
  roles: ('player' | 'storyweaver')[];
  permissions: string[]; // for fine-grained ACL
  displayName?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
  };
  // Optional: Future storyweaver-specific stats
  storyweaverStats?: {
    gamesRun?: number;
    activeCampaigns?: number;
    totalPlayers?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Admin-facing types
export interface PlayerWithAuth extends PlayerType {
  auth: {
    _id: string;
    customerId: string;
    email: string;
    role: string[];
    isActive: boolean;
    notificationSettings: Record<string, boolean>;
    createdAt: Date;
    updatedAt: Date;
    isEmailVerified: boolean;
    acceptedPolicies: Record<string, number>;
    permissions: string[];
    profileRefs: Record<string, string | null>;
  };
}

export interface PlayerStats {
  characterCount: number;
  campaignCount: number;
  activeCampaignCount?: number;
  lastLoginAt?: Date;
}
