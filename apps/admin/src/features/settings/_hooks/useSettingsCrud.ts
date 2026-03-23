// apps/admin/src/features/content/_hooks/useSettingsCrud.ts
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSetting, deleteSetting, getSettings, updateSetting } from "@tapestry/api-client";
import type { SettingDefinition } from "@tapestry/types";
import { api } from "@/lib/api";

type SettingDraft = {
  key: string;
  name: string;
  description: string;
  status: "draft" | "published" | "archived";
  tagsText: string;
  rulesetVersion: number;
  modules: {
    items: boolean;
    lore: boolean;
    maps: boolean;
    magic: boolean;
  };
};

const emptyDraft = (): SettingDraft => ({
  key: "",
  name: "",
  description: "",
  status: "draft",
  tagsText: "",
  rulesetVersion: 1,
  modules: {
    items: true,
    lore: false,
    maps: false,
    magic: false,
  },
});

function toDraft(setting?: SettingDefinition | null): SettingDraft {
  if (!setting) return emptyDraft();

  return {
    key: setting.key ?? "",
    name: setting.name ?? "",
    description: setting.description ?? "",
    status: setting.status ?? "draft",
    tagsText: (setting.tags ?? []).join(", "),
    rulesetVersion: setting.rulesetVersion ?? 1,
    modules: {
      items: !!setting.modules?.items,
      lore: !!setting.modules?.lore,
      maps: !!setting.modules?.maps,
      magic: !!setting.modules?.magic,
    },
  };
}

function toPayload(draft: SettingDraft) {
  return {
    key: draft.key.trim().toLowerCase(),
    name: draft.name.trim(),
    description: draft.description.trim(),
    status: draft.status,
    tags: draft.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    rulesetVersion: draft.rulesetVersion,
    modules: draft.modules,
  };
}

export function useSettingsCrud() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [draft, setDraft] = useState<SettingDraft>(emptyDraft());

  const settingsQuery = useQuery({
    queryKey: ["admin-content", "settings"],
    queryFn: async () => {
      const res = await getSettings(api, {
        pageNumber: 1,
        pageLimit: 200,
        sortOptions: "name",
      });
      return res.payload ?? [];
    },
  });

  const settings = settingsQuery.data ?? [];

  const selected = useMemo(() => settings.find((s) => s._id === selectedId) ?? null, [settings, selectedId]);

  const createMutation = useMutation({
    mutationFn: async () => createSetting(api, toPayload(draft)),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-content", "settings"] });
      setMode("list");
      setDraft(emptyDraft());
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("No setting selected");
      return updateSetting(api, selectedId, toPayload(draft));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-content", "settings"] });
      setMode("list");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("No setting selected");
      return deleteSetting(api, selectedId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-content", "settings"] });
      setSelectedId(null);
      setMode("list");
      setDraft(emptyDraft());
    },
  });

  function startCreate() {
    setSelectedId(null);
    setDraft(emptyDraft());
    setMode("create");
  }

  function startEdit(id: string) {
    const next = settings.find((s) => s._id === id) ?? null;
    setSelectedId(id);
    setDraft(toDraft(next));
    setMode("edit");
  }

  function cancel() {
    setMode("list");
    setDraft(selected ? toDraft(selected) : emptyDraft());
  }

  return {
    settings,
    settingsQuery,
    selected,
    selectedId,
    setSelectedId,
    mode,
    draft,
    setDraft,
    startCreate,
    startEdit,
    cancel,
    save: () => (mode === "create" ? createMutation.mutate() : updateMutation.mutate()),
    remove: () => deleteMutation.mutate(),
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
