"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { StudioSettingSummary } from "../_hooks/useContentStudio";
import Link from "next/link";

import { api } from "@/lib/api";
import styles from "./ContentView.module.scss";

type AbilitiesViewProps = {
  selectedSetting: StudioSettingSummary | null;
};

export default function AbilitiesView({ selectedSetting }: AbilitiesViewProps) {
  const router = useRouter();

  // TODO: Update with actual abilities API endpoint when available
  const abilitiesQuery = useQuery({
    queryKey: ["abilities", "by-setting", selectedSetting?.key],
    queryFn: async () => {
      if (!selectedSetting) return [];
      // Placeholder - replace with actual API call
      // return api.storyweaver.abilities.getBySetting(selectedSetting.key);
      return [];
    },
    enabled: Boolean(selectedSetting?.key),
  });

  const abilities = abilitiesQuery.data ?? [];
  const createHref = selectedSetting
    ? `/abilities/new?settingKey=${encodeURIComponent(selectedSetting.key)}`
    : "/abilities/new";

  return (
    <div className={styles.view}>
      <header className={styles.viewHeader}>
        <div className={styles.viewTitleWrap}>
          <p className={styles.viewEyebrow}>Abilities browser</p>
          <h2 className={styles.viewTitle}>Abilities in this setting</h2>
          <p className={styles.viewCopy}>
            Read-only list of abilities belonging to {selectedSetting?.name ?? "this setting"}. Use Edit or Create
            buttons to manage abilities in dedicated routes.
          </p>
        </div>

        <div className={styles.viewActions}>
          <Link href={createHref} className={styles.actionButton}>
            Create ability
          </Link>
        </div>
      </header>

      <div className={styles.viewContent}>
        {abilitiesQuery.isError ? (
          <div className={styles.notice}>Failed to load abilities. Check auth and API connectivity.</div>
        ) : abilitiesQuery.isLoading ? (
          <div className={styles.notice}>Loading abilities…</div>
        ) : abilities.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No abilities yet</h3>
            <p className={styles.emptyCopy}>Create your first ability for this setting using the button above.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {abilities.map((ability: any) => (
              <div key={ability._id || ability.key} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{ability.name}</span>
                  <span className={styles.itemMeta}>
                    {ability.type ?? "Ability"} · {ability.tier ?? "Basic"}
                  </span>
                </div>
                <div className={styles.itemActions}>
                  <Link href={`/abilities/${ability._id || ability.key}`} className={styles.linkButton}>
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
