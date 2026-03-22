"use client";

import { Tabs } from "@tapestry/ui";
import ContentSidebar from "../contentSidebar/ContentSidebar";
import { useContentStudio } from "../../_hooks/useContentStudio";
import styles from "./ContentStudio.module.scss";
import { createStudioTabs } from "./contentStudio.tabs";

export default function ContentStudio() {
  const studio = useContentStudio();

  return (
    <div className={styles.studio}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Gameplay</p>
        <h1 className={styles.title}>Content studio</h1>
      </header>

      <div className={styles.layout}>
        <ContentSidebar
          settings={studio.settings}
          selectedSettingKey={studio.selectedSettingKey}
          onSelectSetting={studio.setSelectedSettingKey}
          activeType={studio.activeType}
          onSelectType={studio.setActiveType}
          isLoadingSettings={studio.settingsQuery.isLoading}
          loreNodeCount={studio.loreNodeCount}
          loreRootCount={studio.loreTree.length}
        />

        <div className={styles.workspace}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleWrap}>
                <p className={styles.panelEyebrow}>Overview</p>
                <h2 className={styles.panelTitle}>{studio.selectedSetting?.name ?? "Waiting on a setting"}</h2>
                <p className={styles.panelCopy}>
                  {studio.selectedSetting?.description ||
                    "Pick a setting to start attaching content to its root record."}
                </p>
              </div>
            </div>

            <div className={styles.metricGrid}>
              {studio.summaryCards.map((card) => (
                <article key={card.label} className={styles.metricCard}>
                  <span className={styles.metricLabel}>{card.label}</span>
                  <strong className={styles.metricValue}>{card.value}</strong>
                  <p className={styles.metricCopy}>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <Tabs
              activeKey={studio.activeType}
              onChange={(key) => studio.setActiveType(key as any)}
              items={createStudioTabs({
                activeTab: studio.activeType as any,
                selectedSetting: studio.selectedSetting,
              })}
              keepMounted={false}
              hideTabList
            />
          </section>
        </div>
      </div>
    </div>
  );
}
