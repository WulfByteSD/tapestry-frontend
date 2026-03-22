"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteSetting, getSettings, updateSetting } from "@tapestry/api-client";
import type { SettingDefinition } from "@tapestry/types";
import { api } from "@/lib/api";
import SettingsEditorForm from "../settingLane/SettingsEditorForm.component";
import styles from "./SettingEditor.module.scss";
import { useAlert } from "@tapestry/ui";

type Props = {
  settingId: string;
};

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

const toDraft = (setting: SettingDefinition): SettingDraft => ({
  key: setting.key || "",
  name: setting.name || "",
  description: setting.description || "",
  status: setting.status || "draft",
  tagsText: (setting.tags || []).join(", "),
  rulesetVersion: setting.rulesetVersion || 1,
  modules: {
    items: setting.modules?.items ?? false,
    lore: setting.modules?.lore ?? false,
    maps: setting.modules?.maps ?? false,
    magic: setting.modules?.magic ?? false,
  },
});

const toPayload = (draft: SettingDraft) => {
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
};

export function SettingEditor({ settingId }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SettingDraft | null>(null);
  const { addAlert } = useAlert();

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

  const setting = settingsQuery.data?.find((s) => s._id === settingId);

  // Initialize draft when setting loads
  useEffect(() => {
    if (setting && !draft) {
      setDraft(toDraft(setting));
    }
  }, [setting, draft]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!draft) throw new Error("No draft to save");
      return updateSetting(api, settingId, toPayload(draft));
    },
    onSuccess: async () => {
      addAlert({ type: "success", message: "Setting updated successfully." });
      await qc.invalidateQueries({ queryKey: ["admin-content", "settings"] });
      router.push("/settings-admin");
    },
    onError: (error: any) => {
      const messageTxt = error.response && error.response.data.message ? error.response.data.message : error.message;
      addAlert({ type: "error", message: `Failed to update setting. Error: ${messageTxt}` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteSetting(api, settingId),
    onSuccess: async () => {
      addAlert({ type: "success", message: `Deleted "${setting?.name}" successfully.` });
      await qc.invalidateQueries({ queryKey: ["admin-content", "settings"] });
      router.push("/settings-admin");
    },
    onError: (error: any) => {
      const messageTxt = error.response && error.response.data.message ? error.response.data.message : error.message;
      addAlert({ type: "error", message: `Failed to delete "${setting?.name}". Error: ${messageTxt}` });
    },
  });

  const handleSave = () => {
    if (draft) {
      updateMutation.mutate();
    }
  };

  const handleCancel = () => {
    router.push("/settings-admin");
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${setting?.name}"? This action cannot be undone.`,
    );
    if (confirmed) {
      deleteMutation.mutate();
    }
  };

  if (settingsQuery.isLoading) {
    return (
      <div className={styles.editor}>
        <div className={styles.loading}>Loading setting...</div>
      </div>
    );
  }

  if (!setting) {
    return (
      <div className={styles.editor}>
        <div className={styles.error}>Setting not found</div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className={styles.editor}>
        <div className={styles.loading}>Initializing...</div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Content Management</p>
        <h1 className={styles.title}>Edit Setting</h1>
        <p className={styles.subtitle}>{setting.name}</p>
      </header>

      <div className={styles.formContainer}>
        <section className={styles.panel}> 

          <SettingsEditorForm
            mode="edit"
            draft={draft}
            setDraft={(updater) => {
              setDraft((prev) => {
                if (!prev) return prev;
                return typeof updater === "function" ? updater(prev) : updater;
              });
            }}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
            isSaving={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </section>
      </div>
    </div>
  );
}
