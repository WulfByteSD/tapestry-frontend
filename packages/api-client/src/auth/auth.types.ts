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
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles?: string[];
  displayName?: string;
};

export function normalizeRoles(roles: string[] | string) {
  return Array.isArray(roles) ? roles : [roles];
}
