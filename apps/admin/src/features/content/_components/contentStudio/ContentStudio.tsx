"use client";

import ContentSidebar from "../contentSidebar/ContentSidebar";
import ContentList from "../contentList/ContentList";
import LoreEditor from "../loreEditor/LoreEditor";
import LoreTree from "../loreTree/LoreTree.component";
import { useContentStudio } from "../../_hooks/useContentStudio";
import styles from "./ContentStudio.module.scss";
import LoreGraphView from "../loreGraphView/LoreGraph.view";

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

              {studio.activeType === "lore" ? (
                <div className={styles.actionRow}>
                  <button type="button" className={styles.actionButton} onClick={studio.startCreateRoot}>
                    New root node
                  </button>

                  <button
                    type="button"
                    className={styles.ghostButton}
                    disabled={!studio.selectedTreeNode}
                    onClick={studio.startCreateChild}
                  >
                    New child node
                  </button>

                  <button
                    type="button"
                    className={styles.ghostButton}
                    disabled={!studio.selectedTreeNode}
                    onClick={studio.startEditSelected}
                  >
                    Edit selected
                  </button>
                </div>
              ) : null}
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

          {studio.activeType === "lore" ? (
            studio.viewMode === "browser" ? (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleWrap}>
                    <p className={styles.panelEyebrow}>Lore browser</p>
                    <h2 className={styles.panelTitle}>Node graph</h2>
                    <p className={styles.panelCopy}>
                      Pan around the graph, click a node to edit it, or create a new root node.
                    </p>
                  </div>

                  <div className={styles.actionRow}>
                    <button type="button" className={styles.actionButton} onClick={studio.startCreateRoot}>
                      New root node
                    </button>

                    <button
                      type="button"
                      className={styles.ghostButton}
                      disabled={!studio.selectedTreeNode}
                      onClick={studio.startCreateChild}
                    >
                      New child node
                    </button>

                    <button
                      type="button"
                      className={styles.ghostButton}
                      disabled={!studio.selectedTreeNode}
                      onClick={studio.startEditSelected}
                    >
                      Edit selected
                    </button>
                  </div>
                </div>

                {studio.settingsQuery.isError ? (
                  <div className={styles.inlineNotice}>Settings failed to load. Check auth and API origin first.</div>
                ) : studio.loreTreeQuery.isError ? (
                  <div className={styles.inlineNotice}>
                    Lore graph failed to load. That’s route, auth, or backend trouble.
                  </div>
                ) : studio.loreTreeQuery.isLoading ? (
                  <div className={styles.inlineNotice}>Loading lore graph…</div>
                ) : (
                  <LoreGraphView
                    tree={studio.loreTree}
                    selectedKey={studio.selectedLoreKey}
                    onOpenNode={studio.selectLoreNode}
                    settingNode={
                      studio.selectedSetting
                        ? {
                            key: studio.selectedSetting.key,
                            name: studio.selectedSetting.name,
                          }
                        : null
                    }
                  />
                )}
              </section>
            ) : (
              <LoreEditor
                selectedSettingKey={studio.selectedSettingKey}
                selectedNodeKey={studio.selectedLoreKey}
                selectedNodeSummary={studio.selectedNodeSummary}
                mode={studio.editorMode}
                parentOptions={studio.parentOptions}
                relationTargets={studio.relationTargetOptions}
                onSaved={studio.handleLoreSaved}
                onCancelCreate={studio.cancelCreate}
                onBackToBrowser={studio.goBackToBrowser}
              />
            )
          ) : (
            <section className={styles.panel}>
              <ContentList
                title={`${studio.activeType.charAt(0).toUpperCase()}${studio.activeType.slice(1)} lane`}
                copy="This lane now has a dedicated browser component instead of more junk crammed into ContentStudio."
                items={studio.laneItems}
                emptyTitle="No content wired yet"
                emptyCopy="The component is in place. Wire the query + editor when you move to this lane."
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
