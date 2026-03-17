import styles from "./ContentSidebar.module.scss";

export type StudioContentType = "settings" | "lore" | "items" | "abilities" | "skills";

export type StudioSettingSummary = {
  _id: string;
  key: string;
  name: string;
  description?: string;
  modules?: {
    items?: boolean;
    lore?: boolean;
    maps?: boolean;
    magic?: boolean;
  };
};

type ContentSidebarProps = {
  settings: StudioSettingSummary[];
  selectedSettingKey: string | null;
  onSelectSetting: (settingKey: string) => void;
  activeType: StudioContentType;
  onSelectType: (type: StudioContentType) => void;
  isLoadingSettings?: boolean;
  loreNodeCount: number;
  loreRootCount: number;
};

const contentOptions: Array<{
  key: StudioContentType;
  label: string;
  copy: string;
}> = [
  {
    key: "lore",
    label: "Lore",
    copy: "Build the tree, the world, and the connective tissue between places, factions, and NPCs.",
  },
  {
    key: "items",
    label: "Items",
    copy: "Setting-scoped gear, loot, weapons, and tools.",
  },
  {
    key: "abilities",
    label: "Abilities",
    copy: "Special actions, miracles, traits, and mechanical expression.",
  },
  {
    key: "skills",
    label: "Skills",
    copy: "Core and setting-flavored skill definitions.",
  },
  {
    key: "settings",
    label: "Settings",
    copy: "Top-level world records and module availability.",
  },
];

export default function ContentSidebar({
  settings,
  selectedSettingKey,
  onSelectSetting,
  activeType,
  onSelectType,
  isLoadingSettings = false,
  loreNodeCount,
  loreRootCount,
}: ContentSidebarProps) {
  const selectedSetting = settings.find((entry) => entry.key === selectedSettingKey) ?? null;

  const modules = [
    { label: "Items", enabled: !!selectedSetting?.modules?.items },
    { label: "Lore", enabled: !!selectedSetting?.modules?.lore },
    { label: "Maps", enabled: !!selectedSetting?.modules?.maps },
    { label: "Magic", enabled: !!selectedSetting?.modules?.magic },
  ];

  return (
    <aside className={styles.sidebar}>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.eyebrow}>Setting focus</p>
          <h2 className={styles.title}>Choose a world</h2>
          <p className={styles.copy}>
            Everything below this line hangs off a setting. No setting, no content, no tacos.
          </p>
        </div>

        {isLoadingSettings ? (
          <p className={styles.empty}>Loading settings…</p>
        ) : settings.length === 0 ? (
          <p className={styles.empty}>
            No settings were returned yet. The studio shell is ready, but the world list is still empty.
          </p>
        ) : (
          <div className={styles.settingList}>
            {settings.map((setting) => {
              const isActive = selectedSettingKey === setting.key;

              return (
                <button
                  key={setting._id}
                  type="button"
                  onClick={() => onSelectSetting(setting.key)}
                  className={`${styles.settingButton} ${isActive ? styles.settingButtonActive : ""}`}
                >
                  <span className={styles.settingName}>{setting.name}</span>
                  <span className={styles.settingKey}>{setting.key}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.eyebrow}>Authoring lane</p>
          <h2 className={styles.title}>Content type</h2>
          <p className={styles.copy}>Pick the lane you want the right-hand workspace to emphasize first.</p>
        </div>

        <div className={styles.typeList}>
          {contentOptions.map((option) => {
            const isActive = activeType === option.key;
            const disabled = !selectedSetting && option.key !== "settings";

            return (
              <button
                key={option.key}
                type="button"
                disabled={disabled}
                onClick={() => onSelectType(option.key)}
                className={`${styles.typeButton} ${isActive ? styles.typeButtonActive : ""}`}
              >
                <span className={styles.typeLabel}>{option.label}</span>
                <span className={styles.typeCopy}>{option.copy}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.eyebrow}>Current snapshot</p>
          <h2 className={styles.title}>{selectedSetting?.name ?? "No setting selected"}</h2>
          <p className={styles.copy}>Quick-read status for the currently selected setting.</p>
        </div>

        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Lore nodes</span>
            <strong className={styles.statValue}>{loreNodeCount}</strong>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Lore roots</span>
            <strong className={styles.statValue}>{loreRootCount}</strong>
          </div>
        </div>

        <div className={styles.moduleRow}>
          {modules.map((module) => (
            <span
              key={module.label}
              className={`${styles.moduleChip} ${
                module.enabled ? styles.moduleChipEnabled : styles.moduleChipDisabled
              }`}
            >
              {module.label}
            </span>
          ))}
        </div>
      </section>
    </aside>
  );
}
