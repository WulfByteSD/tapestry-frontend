"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@tapestry/api-client";
import { api } from "@/lib/api";
import ContentSidebar, { type StudioContentType, type StudioSettingSummary } from "../contentSidebar/ContentSidebar";
import styles from "./ContentStudio.module.scss";

type LoreStatus = "draft" | "published" | "archived";

type LoreTreeNode = {
  _id: string;
  key: string;
  name: string;
  kind: string;
  status: LoreStatus;
  depth: number;
  parentId?: string | null;
  childCount?: number;
  hasChildren?: boolean;
  children?: LoreTreeNode[];
  summary?: string;
};

const laneCards = [
  {
    title: "Lore as the anchor",
    copy: "Start with tree-aware lore authoring so towns, factions, landmarks, and NPCs can live inside one coherent graph instead of becoming five unrelated tables.",
  },
  {
    title: "Items and abilities next",
    copy: "Once setting selection is stable, item and ability forms can inherit the active setting automatically and stop making the user do repetitive bookkeeping.",
  },
  {
    title: "Skills as a lighter lane",
    copy: "Skills are structurally simpler, so they make good follow-up work after the lore editor establishes the page’s interaction patterns.",
  },
  {
    title: "Relations over fake hierarchy",
    copy: "Use parent/child only for actual containment. Use relations for belongs-to, allied-with, serves, rules, originates-from, and the rest of the delicious setting spaghetti.",
  },
];

function countLoreNodes(nodes: LoreTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countLoreNodes(node.children ?? []), 0);
}

function formatKindLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClass(status: LoreStatus) {
  switch (status) {
    case "published":
      return styles.statusPublished;
    case "archived":
      return styles.statusArchived;
    case "draft":
    default:
      return styles.statusDraft;
  }
}

function renderLoreTree(nodes: LoreTreeNode[]): ReactNode {
  if (!nodes.length) {
    return <div className={styles.treeEmpty}>No lore nodes have been returned for this setting yet.</div>;
  }

  return (
    <ul className={styles.treeList}>
      {nodes.map((node) => (
        <li key={node._id} className={styles.treeItem}>
          <div className={styles.treeNode}>
            <div className={styles.treeNodeHeader}>
              <strong className={styles.treeNodeName}>{node.name}</strong>

              <div className={styles.treeMeta}>
                <span className={styles.kindBadge}>{formatKindLabel(node.kind)}</span>
                <span className={`${styles.statusBadge} ${getStatusClass(node.status)}`}>{node.status}</span>
                <span className={styles.childBadge}>
                  {node.children?.length ?? node.childCount ?? 0} child
                  {(node.children?.length ?? node.childCount ?? 0) === 1 ? "" : "ren"}
                </span>
              </div>
            </div>

            <div className={styles.treeNodeBody}>
              <span className={styles.treeKey}>{node.key}</span>
              {node.summary ? <p className={styles.treeSummary}>{node.summary}</p> : null}
            </div>
          </div>

          {node.children?.length ? <div className={styles.treeBranch}>{renderLoreTree(node.children)}</div> : null}
        </li>
      ))}
    </ul>
  );
}

export default function ContentStudio() {
  const [activeType, setActiveType] = useState<StudioContentType>("lore");
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["admin-content", "settings"],
    queryFn: async () => {
      const response = await getSettings(api, {
        pageNumber: 1,
        pageLimit: 100,
        sortOptions: "name",
      });

      return (response.payload ?? []) as StudioSettingSummary[];
    },
  });

  const settings = settingsQuery.data ?? [];

  useEffect(() => {
    if (!selectedSettingKey && settings.length > 0) {
      setSelectedSettingKey(settings[0].key);
    }
  }, [selectedSettingKey, settings]);

  const selectedSetting = useMemo(
    () => settings.find((entry) => entry.key === selectedSettingKey) ?? null,
    [selectedSettingKey, settings],
  );

  const loreTreeQuery = useQuery({
    queryKey: ["admin-content", "lore-tree", selectedSettingKey],
    enabled: Boolean(selectedSettingKey),
    queryFn: async () => {
      const response = await api.get(`/game/content/lore/tree/${encodeURIComponent(selectedSettingKey as string)}`);

      return (response.data?.payload ?? []) as LoreTreeNode[];
    },
  });

  const loreTree = loreTreeQuery.data ?? [];
  const loreNodeCount = useMemo(() => countLoreNodes(loreTree), [loreTree]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Settings",
        value: String(settings.length),
        copy: "Top-level worlds available to author against.",
      },
      {
        label: "Lore roots",
        value: String(loreTree.length),
        copy: "First-order branches in the current setting tree.",
      },
      {
        label: "Lore nodes",
        value: String(loreNodeCount),
        copy: "Total nodes currently returned by the lore tree endpoint.",
      },
      {
        label: "Current lane",
        value: activeType.charAt(0).toUpperCase() + activeType.slice(1),
        copy: "The studio emphasis on the right-hand side.",
      },
    ],
    [activeType, loreNodeCount, loreTree.length, settings.length],
  );

  return (
    <div className={styles.studio}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Gameplay</p>
        <h1 className={styles.title}>Content studio</h1>
        <p className={styles.subtitle}>
          This is the admin-side authoring shell for settings, lore, items, abilities, and skills. Start with lore,
          because hierarchy is the part most likely to become a cursed mess if we don’t tame it early.
        </p>
      </header>

      <div className={styles.layout}>
        <ContentSidebar
          settings={settings}
          selectedSettingKey={selectedSettingKey}
          onSelectSetting={setSelectedSettingKey}
          activeType={activeType}
          onSelectType={setActiveType}
          isLoadingSettings={settingsQuery.isLoading}
          loreNodeCount={loreNodeCount}
          loreRootCount={loreTree.length}
        />

        <div className={styles.workspace}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleWrap}>
                <p className={styles.panelEyebrow}>Overview</p>
                <h2 className={styles.panelTitle}>{selectedSetting?.name ?? "Waiting on a setting"}</h2>
                <p className={styles.panelCopy}>
                  {selectedSetting?.description ||
                    "Pick a setting to start attaching world content to its root record."}
                </p>
              </div>

              <div className={styles.actionRow}>
                <button type="button" className={styles.actionButton}>
                  New root node
                </button>
                <button type="button" className={styles.ghostButton}>
                  New item
                </button>
                <button type="button" className={styles.ghostButton}>
                  New ability
                </button>
              </div>
            </div>

            <div className={styles.metricGrid}>
              {summaryCards.map((card) => (
                <article key={card.label} className={styles.metricCard}>
                  <span className={styles.metricLabel}>{card.label}</span>
                  <strong className={styles.metricValue}>{card.value}</strong>
                  <p className={styles.metricCopy}>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleWrap}>
                <p className={styles.panelEyebrow}>Primary workspace</p>
                <h2 className={styles.panelTitle}>
                  {activeType === "lore"
                    ? "Lore hierarchy preview"
                    : `${activeType.charAt(0).toUpperCase() + activeType.slice(1)} authoring lane`}
                </h2>
                <p className={styles.panelCopy}>
                  {activeType === "lore"
                    ? "The lore endpoint should return a nested tree here. This gives you immediate visual proof that the hierarchy is behaving."
                    : "The shell is in place. The next pass is wiring create/edit forms into this panel for the selected content type."}
                </p>
              </div>
            </div>

            {settingsQuery.isError ? (
              <div className={styles.inlineNotice}>
                Settings failed to load. Check auth and API origin before blaming the moon.
              </div>
            ) : activeType === "lore" ? (
              loreTreeQuery.isError ? (
                <div className={styles.inlineNotice}>
                  Lore tree failed to load. That usually means the route is still not mounted, auth is missing, or the
                  endpoint is throwing before the handler returns.
                </div>
              ) : loreTreeQuery.isLoading ? (
                <div className={styles.inlineNotice}>Loading lore tree…</div>
              ) : (
                renderLoreTree(loreTree)
              )
            ) : (
              <div className={styles.laneGrid}>
                {laneCards.map((card) => (
                  <article key={card.title} className={styles.laneCard}>
                    <h3 className={styles.laneTitle}>{card.title}</h3>
                    <p className={styles.laneCopy}>{card.copy}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleWrap}>
                <p className={styles.panelEyebrow}>Build order</p>
                <h2 className={styles.panelTitle}>Recommended next slices</h2>
                <p className={styles.panelCopy}>
                  The UI shell should stay light. The value comes from layering real forms into it without letting the
                  structure turn into spaghetti with a CSS degree.
                </p>
              </div>
            </div>

            <div className={styles.laneGrid}>
              {laneCards.map((card) => (
                <article key={card.title} className={styles.laneCard}>
                  <h3 className={styles.laneTitle}>{card.title}</h3>
                  <p className={styles.laneCopy}>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
