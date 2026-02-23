"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ApiResponse<T> = { success: boolean; payload: T; message?: string };

type UpdatePayload = Record<string, any>;

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

function applyDotUpdates<T extends object>(obj: T, updates: Record<string, any>): T {
  let next = obj;
  for (const [path, value] of Object.entries(updates)) {
    next = setPathImmutable(next, path, value);
  }
  return next;
}

export function useUpdateCharacterSheetMutation(characterId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["character:update", characterId],
    mutationFn: async (updates: UpdatePayload) => {
      // IMPORTANT: send $set so Mongo/Mongoose can’t interpret this as a full-document replace.
      // This avoids nuking the sheet if you only update name/notes.
      const res = await api.put(`/game/characters/${characterId}`, { $set: updates });
      return res.data as { success: boolean };
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ["character", characterId] });

      const prev = qc.getQueryData<ApiResponse<any>>(["character", characterId]);

      if (prev?.payload) {
        const nextPayload = applyDotUpdates(prev.payload, updates);
        qc.setQueryData<ApiResponse<any>>(["character", characterId], { ...prev, payload: nextPayload });
      }

      return { prev };
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) qc.setQueryData(["character", characterId], ctx.prev);
    },
    onSettled: () => {
      // since API doesn’t return updated payload, refetch for truth
      qc.invalidateQueries({ queryKey: ["character", characterId] });
    },
  });
}
