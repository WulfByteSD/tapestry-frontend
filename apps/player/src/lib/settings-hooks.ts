import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  deletePushSubscription,
  getPlayerProfile,
  PushSubscriptionJson,
  savePushSubscription,
  sendTestPush,
  updatePlayerProfile,
  updateUserAccount,
  type UpdatePlayerProfileInput,
  type UpdateUserAccountInput,
} from "@tapestry/api-client";
import { useAlert } from "@tapestry/ui";

export function usePlayerProfile(profileId?: string | null) {
  return useQuery({
    queryKey: ["player-profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      return getPlayerProfile(api, profileId);
    },
    enabled: !!profileId,
    staleTime: 60_000,
  });
}

export function useUpdatePlayerProfile(profileId?: string | null) {
  const qc = useQueryClient();
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async (input: UpdatePlayerProfileInput) => {
      if (!profileId) {
        throw new Error("Missing player profile id.");
      }

      return updatePlayerProfile(api, profileId, input);
    },
    onSuccess: async (updated) => {
      qc.setQueryData(["player-profile", profileId], updated);
      await qc.invalidateQueries({ queryKey: ["me"] });
      addAlert({
        type: "success",
        message: "Profile updated successfully.",
      });
    },
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to update profile.",
      });
    },
  });
}

export function useUpdateUserAccount(userId?: string | null) {
  const qc = useQueryClient();
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async (input: UpdateUserAccountInput) => {
      if (!userId) {
        throw new Error("Missing user id.");
      }

      return updateUserAccount(api, userId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      addAlert({
        type: "success",
        message: "Account updated successfully.",
      });
    },
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to update account.",
      });
    },
  });
}
type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

async function changePasswordRequest(userId: string, input: ChangePasswordInput) {
  const res = await api.post(`/auth/change-password`, {
    userId,
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  });

  return res.data;
}

export function useChangePassword(userId?: string | null) {
  const qc = useQueryClient();
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      if (!userId) {
        throw new Error("Missing user id.");
      }

      return changePasswordRequest(userId, input);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me"] });
      addAlert({
        type: "success",
        message: "Password updated successfully.",
      });
    },
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to update password.",
      });
    },
  });
}
export function useSavePushSubscription() {
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async (input: { subscription: PushSubscriptionJson; deviceName?: string; userAgent?: string }) =>
      savePushSubscription(api, input),
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to save push subscription.",
      });
    },
  });
}

export function useDeletePushSubscription() {
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async (input: { endpoint: string }) => deletePushSubscription(api, input),
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to remove push subscription.",
      });
    },
  });
}

export function useSendTestPush() {
  const { addAlert } = useAlert();

  return useMutation({
    mutationFn: async () => sendTestPush(api),
    onSuccess: () => {
      addAlert({
        type: "success",
        message: "Test push sent.",
      });
    },
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to send test push.",
      });
    },
  });
}
