"use client";

import { useRef } from "react";
import { isAxiosError } from "axios";
import type { CharacterSheet } from "@tapestry/types";
import { characterHealthBaseline, changesCharacterHealth, type CharacterHealthBaseline } from "./CharacterHealth.helpers";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAlert } from "@tapestry/ui";
import { ApiResponse, UpdatePayload } from "@tapestry/api-client";
import applyDotUpdates from "@/utils/applyDotUpdates";

export function useUpdateCharacterSheetMutation<T = any>(characterId: string, opts?: { invalidateAfter?: boolean; expectedHealthState?: CharacterHealthBaseline }) {
  const qc = useQueryClient();
  const { addAlert } = useAlert();
  const healthBaselines = useRef(new WeakMap<UpdatePayload, CharacterHealthBaseline>());

  return useMutation({
    mutationKey: ["character:update", characterId],
    mutationFn: async (updates: UpdatePayload) => {
      // Send dot notation keys directly - server will wrap in $set
      const expectedHealthState = healthBaselines.current.get(updates);
      const res = await api.put(`/game/characters/${characterId}`, expectedHealthState ? { ...updates, expectedHealthState } : updates);
      return res.data as ApiResponse<T>;
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["character", characterId] });

      const prev = qc.getQueryData<ApiResponse<T>>(["character", characterId]);

      if (changesCharacterHealth(updates)) {
        const baseline = opts?.expectedHealthState ?? (prev?.payload ? characterHealthBaseline(prev.payload as unknown as CharacterSheet) : undefined);
        if (!baseline) throw new Error("Reload the character before changing health.");
        healthBaselines.current.set(updates, structuredClone(baseline));
      }
      if (prev?.payload) {
        const nextPayload = applyDotUpdates(prev.payload as any, updates);
        qc.setQueryData<ApiResponse<T>>(["character", characterId], { ...prev, payload: nextPayload });
      }
      return { prev };
    },
    onError: (error, _updates, ctx) => {
      if (ctx?.prev) qc.setQueryData(["character", characterId], ctx.prev);
      if (isAxiosError(error) && error.response?.status === 409) {
        addAlert({ type: "error", message: "Health changed while you were editing. The latest sheet is loading; review it before applying again." });
        void qc.invalidateQueries({ queryKey: ["character", characterId] });
      }
    },
    onSuccess: (data) => {
      // Trust server response (this corrects any optimistic drift)
      qc.setQueryData<ApiResponse<T>>(["character", characterId], data);

      // Optional for admin screens where you still want “invalidate + refetch”
      if (opts?.invalidateAfter) qc.invalidateQueries({ queryKey: ["character", characterId] });
    },
  });
}
export function useDeleteCharacterMutation() {
  const qc = useQueryClient();
  const { addAlert } = useAlert();

  return useMutation({
    mutationKey: ["character:delete"],
    mutationFn: async (characterId: string) => {
      const res = await api.delete(`/game/characters/${characterId}`);
      return res.data as ApiResponse<{ _id: string }>;
    },
    onSuccess: (_data, characterId) => {
      // Remove from cache
      qc.removeQueries({ queryKey: ["character", characterId] });
      // Invalidate character list to refresh
      qc.invalidateQueries({ queryKey: ["characters"] });
      addAlert({
        type: "success",
        message: "Character deleted",
      });
    },
  });
}

export function useDuplicateCharacterMutation() {
  const qc = useQueryClient();
  const { addAlert } = useAlert();

  return useMutation({
    mutationKey: ["character:duplicate"],
    mutationFn: async ({ characterId, copyAllData }: { characterId: string; copyAllData: boolean }) => {
      const res = await api.post(`/game/characters/${characterId}/fork`, { copyAllData });
      return res.data as ApiResponse<{ _id: string; name: string }>;
    },
    onSuccess: (data) => {
      // Invalidate character list to show the new duplicate
      qc.invalidateQueries({ queryKey: ["characters"] });
      addAlert({
        type: "success",
        message: `Character duplicated: ${data.payload?.name || "Copy created"}`,
      });
    },
    onError: (error: any) => {
      addAlert({
        type: "error",
        message: error?.response?.data?.message || "Failed to duplicate character",
      });
    },
  });
}
