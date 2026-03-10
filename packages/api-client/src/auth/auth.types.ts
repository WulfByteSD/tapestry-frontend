export type LoginResponse = {
  message: string;
  token: string;
  isEmailVerified?: boolean;
  profileRefs?: Record<string, string | null>;
};

export type MeResponse = {
  payload: {
    _id: string;
    email: string;
    fullName?: string;
    roles: string[] | string;
    acceptedPolicies?: Record<string, any>;
    notificationSettings?: Record<string, any>;
    profileRefs?: Record<string, string | null>;
  };
};

export type RegisterInput = {
  auth: {
    email: string;
    password: string;
  };
  player: {
    displayName: string;
    bio?: string;
    timezone?: string;
    roles: string[];
  };
};

export function normalizeRoles(roles: string[] | string) {
  return Array.isArray(roles) ? roles : [roles];
}
