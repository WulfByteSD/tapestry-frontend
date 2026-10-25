"use client";

import Image from 'next/image';
import { FiArrowUpRight, FiBookOpen } from 'react-icons/fi';
import { useFetchResource } from '../../hooks/useFetchResource';
import { characterBuilderResource, playersGuideResource, printableSheetResource, quickstartResource, startPlayingResourceSlugs } from './StartPlaying.data';
import { getGuidePresentation, getPublicPdfHref } from './StartPlaying.helpers';
import styles from './StartPlaying.module.scss';

export function StartPlayingSection() {
  const quickstartQuery = useFetchResource(startPlayingResourceSlugs.quickstart);
  const playersGuideQuery = useFetchResource(startPlayingResourceSlugs.playersGuide);
  const quickstart = getGuidePresentation(quickstartResource, quickstartQuery.resource);
  const playersGuide = getGuidePresentation(playersGuideResource, playersGuideQuery.resource);
  const quickstartHref = getPublicPdfHref(quickstartQuery.resource, process.env.NEXT_PUBLIC_API_ORIGIN);
  const playersGuideHref = getPublicPdfHref(playersGuideQuery.resource, process.env.NEXT_PUBLIC_API_ORIGIN);

  return (
    <section id="start-playing" className={styles.section} aria-labelledby="start-playing-title">
      <header className={styles.header}>
        <p className={styles.kicker}>Free guides. A place to begin.</p>
        <h1 id="start-playing-title">Pull your first Thread.</h1>
        <p>Start with the Quickstart, then explore the Player’s Guide when you want to go deeper. Both guides are free.</p>
      </header>

      <article className={styles.quickstart} aria-labelledby="quickstart-title">
        <div className={styles.quickstartMark} aria-hidden="true"><FiBookOpen /><span>Tapestry</span><strong>Quickstart</strong><span>Your first session starts here.</span></div>
        <div className={styles.copy}>
          <p className={styles.kicker}>01 · Learn the game</p>
          <h2 id="quickstart-title">{quickstart.title}</h2>
          <p>{quickstart.description}</p>
          <p className={styles.details}>3d6 · A Storyweaver and players · Free PDF</p>
          {quickstartHref ? <a className={styles.primaryAction} href={quickstartHref} target="_blank" rel="noreferrer">Open the Quickstart PDF <FiArrowUpRight aria-hidden="true" /></a> : <p className={styles.availability} role="status">{quickstartQuery.isLoading ? 'Checking guide availability…' : 'The Quickstart download is temporarily unavailable. Please try again later.'}</p>}
          {quickstartHref ? <p className={styles.note}>Opens in a new tab. Save a copy from your browser’s PDF viewer.</p> : null}
        </div>
      </article>

      <article className={styles.playersGuide} aria-labelledby="players-guide-title">
        <Image src={playersGuide.coverSrc} alt="Tapestry Player’s Guide cover" width={500} height={750} sizes="(max-width: 720px) 155px, 220px" className={styles.cover} />
        <div className={styles.copy}>
          <p className={styles.kicker}>02 · Go deeper</p>
          <h2 id="players-guide-title">{playersGuide.title}</h2>
          <p>{playersGuide.description}</p>
          {playersGuideHref ? <a className={styles.primaryAction} href={playersGuideHref} target="_blank" rel="noreferrer">Open the Player’s Guide PDF <FiArrowUpRight aria-hidden="true" /></a> : <p className={styles.availability} role="status">{playersGuideQuery.isLoading ? 'Checking guide availability…' : 'The Player’s Guide download is temporarily unavailable. Please try again later.'}</p>}
          {playersGuideHref ? <p className={styles.note}>Free PDF. Opens in a new tab; save a copy from your browser’s PDF viewer.</p> : null}
        </div>
      </article>

      <section className={styles.characterSection} aria-labelledby="create-character-title">
        <div><p className={styles.kicker}>Bring a character to the table</p><h2 id="create-character-title">Find your starting point.</h2></div>
        <div className={styles.characterOptions}>
          <div><h3>{characterBuilderResource.title}</h3><p>{characterBuilderResource.description}</p><a href={characterBuilderResource.href} target="_blank" rel="noreferrer">Open the character builder <FiArrowUpRight aria-hidden="true" /><span className={styles.srOnly}> (opens in a new tab)</span></a><p className={styles.note}>{characterBuilderResource.accessNote}</p></div>
          <div><h3>{printableSheetResource.title}</h3><p>A standalone printable character sheet is still in preparation.</p><span className={styles.note}>Not available yet</span></div>
        </div>
      </section>
    </section>
  );
}
