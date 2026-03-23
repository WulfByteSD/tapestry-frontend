"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { StudioSettingSummary } from "../_hooks/useContentStudio";

import { api } from "@/lib/api";
import LoreGraphView from "../_components/loreGraphView/LoreGraph.view";
import styles from "./ContentView.module.scss";

type LoreViewProps = {
  selectedSetting: StudioSettingSummary | null;
};

export default function LoreView({ selectedSetting }: LoreViewProps) {
  const router = useRouter();

  const loreTreeQuery = useQuery({
    queryKey: ["lore", "tree", selectedSetting?.key],
    queryFn: async () => {
      if (!selectedSetting) return [];
      const response = await api.get(`/game/content/lore/tree/${encodeURIComponent(selectedSetting.key)}`);
      return (response.data?.payload ?? []) as any[];
    },
    enabled: Boolean(selectedSetting?.key),
  });

  const loreTree = loreTreeQuery.data ?? [];
  const createRootHref = selectedSetting
    ? `/content/node/new?settingKey=${encodeURIComponent(selectedSetting.key)}`
    : null;

  return (
    <div className={styles.view}>
      <header className={styles.viewHeader}>
        <div className={styles.viewTitleWrap}>
          <p className={styles.viewEyebrow}>Lore browser</p>
          <h2 className={styles.viewTitle}>Node graph</h2>
          <p className={styles.viewCopy}>
            This graph is now the atlas for the setting. Click a node to open its dedicated workspace page.
          </p>
        </div>

        <div className={styles.viewActions}>
          <button
            type="button"
            className={styles.actionButton}
            disabled={!createRootHref}
            onClick={() => {
              if (!createRootHref) return;
              router.push(createRootHref);
            }}
          >
            New root node
          </button>
        </div>
      </header>

      <div className={styles.viewContent}>
        {loreTreeQuery.isError ? (
          <div className={styles.notice}>Lore graph failed to load. That's route, auth, or backend trouble.</div>
        ) : loreTreeQuery.isLoading ? (
          <div className={styles.notice}>Loading lore graph…</div>
        ) : (
          <LoreGraphView
            tree={loreTree}
            selectedKey={null}
            settingNode={
              selectedSetting
                ? {
                    key: selectedSetting.key,
                    name: selectedSetting.name,
                  }
                : null
            }
            onOpenNode={(node) => {
              router.push(`/content/node/${node._id}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
