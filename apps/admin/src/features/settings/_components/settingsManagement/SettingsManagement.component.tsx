"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSetting, getSettings } from "@tapestry/api-client";
import { api } from "@/lib/api";
import { Modal, TextField } from "@tapestry/ui";
import SettingsList from "./SettingsList.component";
import styles from "./SettingsManagement.module.scss";

export default function SettingsManagement() {
  const router = useRouter();
  const qc = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSettingName, setNewSettingName] = useState("");

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

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload = {
        name: name.trim(),
        key: name.trim().toLowerCase().replace(/\s+/g, "-"),
        status: "draft" as const,
      };
      return createSetting(api, payload);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-content", "settings"] });
      setIsCreateModalOpen(false);
      setNewSettingName("");
      // Navigate to edit page with the new setting's ID
      if (data.payload?._id) {
        router.push(`/settings-admin/${data.payload._id}`);
      }
    },
  });

  const settings = settingsQuery.data ?? [];

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = () => {
    if (newSettingName.trim()) {
      createMutation.mutate(newSettingName);
    }
  };

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false);
    setNewSettingName("");
  };

  return (
    <div className={styles.management}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Content Management</p>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          Manage game world settings—the root records that organize lore, items, abilities, and other content.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrap}>
              <p className={styles.panelEyebrow}>All Settings</p>
              <h2 className={styles.panelTitle}>Settings list</h2>
              <p className={styles.panelCopy}>
                {settings.length} {settings.length === 1 ? "setting" : "settings"} available
              </p>
            </div>

            <button type="button" onClick={handleCreateClick} className={styles.createButton}>
              Create Setting
            </button>
          </div>

          <SettingsList settings={settings} isLoading={settingsQuery.isLoading} />
        </section>
      </div>

      <Modal
        open={isCreateModalOpen}
        title="Create new setting"
        onCancel={handleCreateCancel}
        onOk={handleCreateSubmit}
        okText="Create"
        confirmLoading={createMutation.isPending}
        width={480}
      >
        <TextField
          label="Setting name"
          value={newSettingName}
          onChange={(e) => setNewSettingName(e.target.value)}
          placeholder="e.g., Core Rulebook, House Rules"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && newSettingName.trim()) {
              handleCreateSubmit();
            }
          }}
        />
      </Modal>
    </div>
  );
}
