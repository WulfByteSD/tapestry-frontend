import { AxiosInstance } from 'axios';
import { AuthType, PlayerType } from '../../../types/src';

export type UpdateUserAccountInput = {
  email?: string;
  notificationSettings?: Record<string, unknown>;
};

export type UpdateAuthAccountInput = {
  email?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
};

export type ResetPasswordInput = {
  sendNotification?: boolean;
};

export type SetPasswordInput = {
  password: string;
  sendNotification?: boolean;
};

export type UpdatePlayerProfileInput = {
  displayName?: string;
  bio?: string;
  timezone?: string;
  avatar?: string;
  preferences?: PlayerType['preferences'];
  roles?: string[];
};

export async function getPlayerProfile(api: AxiosInstance, profileId: string) {
  const res = await api.get(`/profiles/player/${profileId}`);
  return res.data.payload as PlayerType;
}

export async function updatePlayerProfile(api: AxiosInstance, profileId: string, input: UpdatePlayerProfileInput) {
  const res = await api.put(`/profiles/player/${profileId}`, input);
  return res.data.payload as PlayerType;
}

export async function updateUserAccount(api: AxiosInstance, userId: string, input: UpdateUserAccountInput) {
  const res = await api.put(`/user/${userId}`, input);
  return res.data.payload as AuthType;
}

export async function updateAuthAccount(api: AxiosInstance, authId: string, input: UpdateAuthAccountInput) {
  const res = await api.put(`/auth/users/${authId}`, input);
  return res.data.payload as AuthType;
}

export async function resetUserPassword(api: AxiosInstance, authId: string, input: ResetPasswordInput) {
  const res = await api.post(`/auth/users/${authId}/reset-password`, input);
  return res.data;
}

export async function setCustomPassword(api: AxiosInstance, authId: string, input: SetPasswordInput) {
  const res = await api.post(`/auth/users/${authId}/set-password`, input);
  return res.data;
}
