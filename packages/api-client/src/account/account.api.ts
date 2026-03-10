import { AxiosInstance } from "axios"; 
import { AuthType, PlayerType } from "../../../types/src";

export type UpdateUserAccountInput = {
  email?: string;
  notificationSettings?: Record<string, unknown>;
};

export type UpdatePlayerProfileInput = {
  displayName?: string;
  bio?: string;
  timezone?: string;
  avatar?: string;
  preferences?: PlayerType["preferences"];
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
