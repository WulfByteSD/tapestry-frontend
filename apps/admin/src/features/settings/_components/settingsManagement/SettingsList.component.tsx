"use client";

import Link from "next/link";
import type { SettingDefinition } from "@tapestry/types";
import styles from "./SettingsManagement.module.scss";

type Props = {
  settings: SettingDefinition[];
  isLoading: boolean;
};

export default function SettingsList({ settings, isLoading }: Props) {
  if (isLoading) {
    return <div className={styles.notice}>Loading settings...</div>;
  }

  if (settings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>No settings yet</p>
        <p className={styles.emptyCopy}>Create your first setting to start organizing content.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {settings.map((setting) => {
        const moduleCount = [
          setting.modules?.items,
          setting.modules?.lore,
          setting.modules?.maps,
          setting.modules?.magic,
        ].filter(Boolean).length;

        const statusClass =
          setting.status === "published"
            ? styles.statusPublished
            : setting.status === "draft"
              ? styles.statusDraft
              : styles.statusArchived;

        return (
          <div key={setting._id} className={styles.listItem}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{setting.name}</h3>
              <p className={styles.itemMeta}>
                <span>{setting.key}</span>
                <span className={styles.metaDivider}>·</span>
                <span className={`${styles.statusBadge} ${statusClass}`}>{setting.status}</span>
                <span className={styles.metaDivider}>·</span>
                <span>
                  {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                </span>
              </p>
              {setting.description && <p className={styles.itemDescription}>{setting.description}</p>}
            </div>

            <div className={styles.itemActions}>
              <Link href={`/settings-admin/${setting._id}`} className={styles.actionButton}>
                Edit
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
