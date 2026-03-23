"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { StudioSettingSummary } from "../_hooks/useContentStudio";
import Link from "next/link";

import { api } from "@/lib/api";
import styles from "./ContentView.module.scss";

type ItemsViewProps = {
  selectedSetting: StudioSettingSummary | null;
};

export default function ItemsView({ selectedSetting }: ItemsViewProps) {
  const router = useRouter();

  // TODO: Update with actual items API endpoint when available
  const itemsQuery = useQuery({
    queryKey: ["items", "by-setting", selectedSetting?.key],
    queryFn: async () => {
      if (!selectedSetting) return [];
      // Placeholder - replace with actual API call
      // return api.storyweaver.items.getBySetting(selectedSetting.key);
      return [];
    },
    enabled: Boolean(selectedSetting?.key),
  });

  const items = itemsQuery.data ?? [];
  const createHref = selectedSetting
    ? `/items/new?settingKey=${encodeURIComponent(selectedSetting.key)}`
    : "/items/new";

  return (
    <div className={styles.view}>
      <header className={styles.viewHeader}>
        <div className={styles.viewTitleWrap}>
          <p className={styles.viewEyebrow}>Items browser</p>
          <h2 className={styles.viewTitle}>Items in this setting</h2>
          <p className={styles.viewCopy}>
            Read-only list of items belonging to {selectedSetting?.name ?? "this setting"}. Use Edit or Create buttons
            to manage items in dedicated routes.
          </p>
        </div>

        <div className={styles.viewActions}>
          <Link href={createHref} className={styles.actionButton}>
            Create item
          </Link>
        </div>
      </header>

      <div className={styles.viewContent}>
        {itemsQuery.isError ? (
          <div className={styles.notice}>Failed to load items. Check auth and API connectivity.</div>
        ) : itemsQuery.isLoading ? (
          <div className={styles.notice}>Loading items…</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No items yet</h3>
            <p className={styles.emptyCopy}>Create your first item for this setting using the button above.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {items.map((item: any) => (
              <div key={item._id || item.key} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>
                    {item.category ?? "Item"} · {item.rarity ?? "Common"}
                  </span>
                </div>
                <div className={styles.itemActions}>
                  <Link href={`/items/${item._id || item.key}`} className={styles.linkButton}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
