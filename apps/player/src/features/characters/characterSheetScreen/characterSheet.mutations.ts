"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAlert } from "@tapestry/ui";

type ApiResponse<T> = { success: boolean; payload: T; message?: string };
type UpdatePayload = Record<string, any>;

/**
 * Immutably updates a single nested property in an object using dot notation.
 * Creates new objects along the path while preserving references to unchanged branches.
 *
 * @param obj - The source object to update
 * @param path - Dot-notation path to the property (e.g., "sheet.notes" or "sheet.hp.current")
 * @param value - The new value to set at the path
 * @returns A new object with the specified path updated, original object unchanged
 *
 * @example
 * const updated = setPathImmutable(character, "sheet.notes", "New notes");
 * // Returns new object with character.sheet.notes = "New notes"
 * // Original character object remains unchanged
 */
function setPathImmutable<T extends object>(obj: T, path: string, value: any): T {
  const keys = path.split(".");
  const out: any = Array.isArray(obj) ? [...(obj as any)] : { ...(obj as any) };

  let curOut: any = out;
  let curIn: any = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const nextIn = curIn?.[k];

    let nextOut: any;
    if (Array.isArray(nextIn)) nextOut = [...nextIn];
    else if (nextIn && typeof nextIn === "object") nextOut = { ...nextIn };
    else nextOut = {};

    curOut[k] = nextOut;
    curOut = nextOut;
    curIn = nextIn;
  }

  curOut[keys[keys.length - 1]] = value;
  return out;
}

/**
 * Applies multiple dot-notation updates to an object immutably.
 * Sequentially applies each update using setPathImmutable to create a new object
 * with all specified properties updated.
 *
 * @param obj - The source object to update
 * @param updates - Object mapping dot-notation paths to new values
 * @returns A new object with all updates applied, original object unchanged
 *
 * @example
 * const result = applyDotUpdates(character, {
 *   "name": "New Name",
 *   "sheet.notes": "Updated notes",
 *   "sheet.hp.current": 10
 * });
 * // Returns new object with all three properties updated
 */
function applyDotUpdates<T extends object>(obj: T, updates: Record<string, any>): T {
  let next = obj;
  for (const [path, value] of Object.entries(updates)) {
    next = setPathImmutable(next, path, value);
  }
  return next;
}

export function useUpdateCharacterSheetMutation<T = any>(characterId: string, opts?: { invalidateAfter?: boolean }) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["character:update", characterId],
    mutationFn: async (updates: UpdatePayload) => {
      // Send dot notation keys directly - server will wrap in $set
      console.log("Updating character", characterId, "with", updates);
      const res = await api.put(`/game/characters/${characterId}`, updates);
      return res.data as ApiResponse<T>;
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["character", characterId] });

      const prev = qc.getQueryData<ApiResponse<T>>(["character", characterId]);

      if (prev?.payload) {
        const nextPayload = applyDotUpdates(prev.payload as any, updates);
        qc.setQueryData<ApiResponse<T>>(["character", characterId], { ...prev, payload: nextPayload });
      }
      return { prev };
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) qc.setQueryData(["character", characterId], ctx.prev);
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
