// Base profile interface that can be extended for specific profile types
export interface IProfile {
  _id: string;
  userId: string;
  profileType: "athlete" | "admin" | "player" | string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Profile response wrapper
export interface ProfileResponse<T = IProfile> {
  payload: T;
}
