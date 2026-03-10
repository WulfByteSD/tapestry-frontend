export interface AuthType {
  _id: string;
  firstName: string;
  lastName: string;
  customerId: string;
  email: string;
  role: string[];
  fullName: string;
  isActive: boolean;
  notificationSettings: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  acceptedPolicies: Record<string, number>;
  permissions: string[];
  profileRefs: Record<string, string | null>;
}
