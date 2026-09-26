'use client';

import { FiBookOpen, FiCompass, FiFlag, FiLayers, FiMapPin, FiStar } from 'react-icons/fi';

import { getSettingModuleLabels, wovenRealmsEntryPoints, wovenRealmsHighlights, wovenRealmsSourcebooks } from './settings.data';
import styles from './Settings.module.scss';
import { usePortalSettings } from './usePortalSettings';

const entryPointIcons = [FiMapPin, FiFlag, FiCompass] as const;

export function SettingsFeature() {
  const { settings, isFallback, isLoading } = usePortalSettings();

  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.hero} aria-labelledby="woven-realms-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Official settings</p>
            <h1 id="woven-realms-title">Step into the Woven Realms.</h1>
            <p className={styles.description}>
              Tapestry settings are where system pressure becomes local: the kingdoms that are slipping, the villages that keep standing anyway, and the memories the world refuses to let go.
            </p>
          </div>

          <aside className={styles.heroNote} aria-label="Archive status">
            <span>Archive state</span>
            <strong>{isLoading ? 'Loading published settings...' : isFallback ? 'Showing canon-backed fallback content' : 'Showing published settings from the archive'}</strong>
            <p>
              The setting page can read from the content API when published settings exist, but it keeps a static Woven Realms presentation so the portal still speaks with the right voice when the archive is empty.
            </p>
          </aside>
        </section>

        <section className={styles.archiveSection} aria-labelledby="official-settings-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Published settings</p>
            <h2 id="official-settings-title">Official settings in the archive.</h2>
            <p>These cards come from the backend when available. The Woven Realms remains the canonical fallback until more official settings are published.</p>
          </div>

          <div className={styles.settingsGrid}>
            {settings.map((setting) => {
              const moduleLabels = getSettingModuleLabels(setting);

              return (
                <article key={setting._id || setting.key} className={styles.settingCard}>
                  <div className={styles.settingHeader}>
                    <div>
                      <p>{setting.status}</p>
                      <h3>{setting.name}</h3>
                    </div>

                    <span>{setting.key}</span>
                  </div>

                  <p className={styles.settingBody}>{setting.description || 'Official setting metadata is present, but a longer description has not been published yet.'}</p>

                  {setting.tags?.length ? (
                    <ul className={styles.tagList} aria-label={`${setting.name} tags`}>
                      {setting.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}

                  {moduleLabels.length ? (
                    <div className={styles.moduleRow} aria-label={`${setting.name} enabled modules`}>
                      {moduleLabels.map((module) => (
                        <span key={module}>
                          <FiLayers aria-hidden="true" />
                          {module}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.dossierSection} aria-labelledby="woven-realms-dossier-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Featured setting</p>
            <h2 id="woven-realms-dossier-title">Why Woven Realms is the portal anchor setting.</h2>
            <p>
              The canon describes a realm where memory and fate are active forces. It can hold frontier survival, political fracture, mythic stakes, and intimate stories without changing the underlying engine.
            </p>
          </div>

          <div className={styles.dossierCard}>
            <div className={styles.dossierIntro}>
              <p className={styles.badge}>Woven Realms</p>
              <h3>A world in motion, not a museum piece.</h3>
              <p>
                The Woven Realms are built for play that starts small and becomes consequential. Villages, vows, rival banners, and failed promises all stay visible long enough to matter.
              </p>
            </div>

            <ul className={styles.highlightList} aria-label="Woven Realms highlights">
              {wovenRealmsHighlights.map((highlight) => (
                <li key={highlight}>
                  <FiStar aria-hidden="true" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.entrySection} aria-labelledby="entry-points-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Where to begin</p>
            <h2 id="entry-points-title">Three strong entry points into the setting.</h2>
            <p>Each of these comes directly from the canon material and gives the portal a clear way to talk about play without flattening the setting into generic fantasy.</p>
          </div>

          <div className={styles.entryGrid}>
            {wovenRealmsEntryPoints.map((entryPoint, index) => {
              const Icon = entryPointIcons[index] ?? FiMapPin;

              return (
                <article key={entryPoint.title} className={styles.entryCard}>
                  <div className={styles.entryIcon} aria-hidden="true">
                    <Icon />
                  </div>

                  <p>{entryPoint.eyebrow}</p>
                  <h3>{entryPoint.title}</h3>
                  <p>{entryPoint.description}</p>

                  <ul className={styles.tagList} aria-label={`${entryPoint.title} highlights`}>
                    {entryPoint.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.sourcebookSection} aria-labelledby="sourcebooks-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Canon sources</p>
            <h2 id="sourcebooks-title">The setting books behind this page.</h2>
            <p>
              Until every world document is published as a library resource, these summaries stay grounded in the PDF archive so the portal can present official language and priorities without inventing new lore.
            </p>
          </div>

          <div className={styles.sourcebookGrid}>
            {wovenRealmsSourcebooks.map((resource) => (
              <article key={resource.slug} className={styles.sourcebookCard}>
                <div className={styles.sourcebookHeader}>
                  <div className={styles.sourcebookIcon} aria-hidden="true">
                    <FiBookOpen />
                  </div>

                  <div>
                    <p>{resource.eyebrow}</p>
                    <h3>{resource.title}</h3>
                  </div>
                </div>

                <p className={styles.settingBody}>{resource.description || resource.summary}</p>

                <ul className={styles.sourcebookBullets} aria-label={`${resource.title} details`}>
                  {resource.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <div className={styles.sourcebookFooter}>
                  <span>{resource.note}</span>

                  <div className={styles.tagList} aria-label={`${resource.title} tags`}>
                    {resource.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
