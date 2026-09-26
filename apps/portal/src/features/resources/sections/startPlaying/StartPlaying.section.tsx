'use client';

import { InteractiveBook } from '@tapestry/ui';
import { FiArrowUpRight, FiBookOpen, FiClock, FiDownload, FiFileText, FiMonitor, FiPrinter, FiUsers } from 'react-icons/fi';
import { useFetchResource } from '../../hooks/useFetchResource';
import {
  characterBuilderResource,
  playersGuideResource,
  printableSheetResource,
  quickstartResource,
  startPlayingResourceSlugs,
  withFetchedActionResource,
  withFetchedGuideResource,
} from './StartPlaying.data';
import styles from './StartPlaying.module.scss';

export function StartPlayingSection() {
  const { resource: quickstartResourceFromServer } = useFetchResource(startPlayingResourceSlugs.quickstart);
  const { resource: characterBuilderResourceFromServer } = useFetchResource(startPlayingResourceSlugs.characterBuilder);
  const { resource: printableSheetResourceFromServer } = useFetchResource(startPlayingResourceSlugs.printableSheet);
  const { resource: playersGuideResourceFromServer } = useFetchResource(startPlayingResourceSlugs.playersGuide);

  const quickstart = withFetchedGuideResource(quickstartResource, quickstartResourceFromServer);
  const characterBuilder = withFetchedActionResource(characterBuilderResource, characterBuilderResourceFromServer);
  const printableSheet = withFetchedActionResource(printableSheetResource, printableSheetResourceFromServer);
  const playersGuide = withFetchedGuideResource(playersGuideResource, playersGuideResourceFromServer);

  return (
    <section id="start-playing" className={styles.section} aria-labelledby="start-playing-title">
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>Start playing</p>
          <h1 id="start-playing-title">Pull your first Thread.</h1>
          <p className={styles.description}>Learn the essentials, create a character, and bring your group to the table. Everything needed to begin is free.</p>
        </div>

        <aside className={styles.startNote} aria-label="Recommended starting point">
          <span>New to Tapestry?</span>
          <strong>Begin with the Quickstart.</strong>
          <p>You do not need to read the complete Player’s Guide before your first session.</p>
        </aside>
      </header>

      <article className={styles.quickstartCard}>
        <div className={styles.bookStage}>
          <InteractiveBook
            title={quickstart.title}
            coverSrc={quickstart.coverSrc}
            coverAlt={`${quickstart.title} cover`}
            expanded
            showMetadata={false}
            showSpineLabel={false}
            width="clamp(14rem, 22vw, 18rem)"
            height="clamp(20.5rem, 32vw, 26.5rem)"
            spineWidth="3.75rem"
          />
        </div>

        <div className={styles.quickstartCopy}>
          <p className={styles.stepLabel}>{quickstart.eyebrow}</p>
          <h2>{quickstart.title}</h2>
          <p className={styles.resourceDescription}>{quickstart.description}</p>

          <ul className={styles.factList} aria-label="Quickstart details">
            <li>
              <FiUsers aria-hidden="true" />
              {quickstart.facts[0]}
            </li>
            <li>
              <FiUsers aria-hidden="true" />
              {quickstart.facts[1]}
            </li>
            <li>
              <FiBookOpen aria-hidden="true" />
              {quickstart.facts[2]}
            </li>
            <li>
              <FiClock aria-hidden="true" />
              {quickstart.facts[3]}
            </li>
            <li>
              <FiFileText aria-hidden="true" />
              {quickstart.facts[4]}
            </li>
          </ul>

          <div className={styles.actions}>
            <a className={styles.primaryAction} href={quickstart.downloadHref} target="_blank" rel="noreferrer">
              <FiDownload aria-hidden="true" />
              Download the Quickstart
            </a>
            <a className={styles.secondaryAction} href={quickstart.previewHref} target="_blank" rel="noreferrer">
              Preview the guide
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </article>

      <section className={styles.characterSection} aria-labelledby="create-character-title">
        <div className={styles.sectionHeading}>
          <p className={styles.stepLabel}>02 — Create your character</p>
          <h2 id="create-character-title">Choose digital convenience or pencil and paper.</h2>
          <p>Both paths use the same character rules. Pick the format that makes it easiest for your table to begin.</p>
        </div>

        <div className={styles.characterGrid}>
          <article className={`${styles.optionCard} ${styles.digitalCard}`}>
            <div className={styles.optionIcon} aria-hidden="true">
              <FiMonitor />
            </div>
            <div>
              <p className={styles.optionEyebrow}>{characterBuilder.eyebrow}</p>
              <h3>{characterBuilder.title}</h3>
              <p>{characterBuilder.description}</p>
            </div>
            <div className={styles.optionFooter}>
              <a className={styles.primaryAction} href={characterBuilder.href} target="_blank" rel="noreferrer">
                {characterBuilder.actionLabel}
                <FiArrowUpRight aria-hidden="true" />
              </a>
              <span>{characterBuilder.accessNote}</span>
            </div>
          </article>

          <article className={`${styles.optionCard} ${styles.paperCard}`}>
            <div className={styles.optionIcon} aria-hidden="true">
              <FiPrinter />
            </div>
            <div>
              <p className={styles.optionEyebrow}>{printableSheet.eyebrow}</p>
              <h3>{printableSheet.title}</h3>
              <p>{printableSheet.description}</p>
            </div>
            <div className={styles.optionFooter}>
              <span className={styles.pendingAction} aria-disabled="true">
                <FiFileText aria-hidden="true" />
                Printable sheet coming soon
              </span>
              <span>{printableSheet.accessNote}</span>
            </div>
          </article>
        </div>
      </section>

      <article className={styles.guideCard}>
        <div className={styles.guideCopy}>
          <p className={styles.stepLabel}>{playersGuide.eyebrow}</p>
          <h2>Ready to build beyond the basics?</h2>
          <p>{playersGuide.description}</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href={playersGuide.downloadHref} target="_blank" rel="noreferrer">
              <FiDownload aria-hidden="true" />
              Download the full guide
            </a>
            <a className={styles.secondaryAction} href={playersGuide.previewHref} target="_blank" rel="noreferrer">
              Preview the guide
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.guideBook}>
          <InteractiveBook
            title={playersGuide.title}
            coverSrc={playersGuide.coverSrc}
            coverAlt={`${playersGuide.title} cover`}
            expanded
            showMetadata={false}
            showSpineLabel={false}
            width="clamp(10.5rem, 15vw, 13.5rem)"
            height="clamp(15.5rem, 22vw, 20rem)"
            spineWidth="3rem"
          />
        </div>
      </article>
    </section>
  );
}
