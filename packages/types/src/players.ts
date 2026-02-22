export interface PlayerType {
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
