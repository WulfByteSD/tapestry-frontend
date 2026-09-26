import Link from 'next/link';
import { FiArrowRight, FiBook, FiMapPin } from 'react-icons/fi';

import { portalRoutes } from '@/config/portal-routes';

import { worldCards, worldTensions } from './ExploreWorlds.data';
import styles from './ExploreWorlds.module.scss';

export function ExploreWorldsSection() {
  return (
    <section id="explore-worlds" className={styles.section} aria-labelledby="explore-worlds-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Explore worlds</p>
          <h2 id="explore-worlds-title">Find the place where your Thread starts to pull.</h2>
        </div>

        <p className={styles.description}>
          Tapestry settings are not backdrops. They are pressure systems. The Woven Realms remember what people do, and the frontier makes sure those choices get tested quickly.
        </p>
      </header>

      <div className={styles.tensionRail} aria-label="Current Woven Realms tensions">
        {worldTensions.map((tension) => (
          <span key={tension}>{tension}</span>
        ))}
      </div>

      <div className={styles.worldGrid}>
        {worldCards.map((world) => (
          <article key={world.title} className={styles.worldCard}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBadge} aria-hidden="true">
                <FiMapPin />
              </div>

              <div>
                <p>{world.eyebrow}</p>
                <h3>{world.title}</h3>
              </div>
            </div>

            <p className={styles.worldBody}>{world.description}</p>

            <ul className={styles.tagList} aria-label={`${world.title} highlights`}>
              {world.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className={styles.ctaCard}>
        <div className={styles.ctaCopy}>
          <div className={styles.iconBadge} aria-hidden="true">
            <FiBook />
          </div>

          <div>
            <p className={styles.ctaLabel}>Go deeper</p>
            <h3>Open the official setting page for Woven Realms.</h3>
            <p>That page is where the portal now collects published settings from the backend, plus the canon-backed fallback material for Woven Realms and Everpine.</p>
          </div>
        </div>

        <Link className={styles.primaryAction} href={portalRoutes.settings.wovenRealms}>
          Explore Woven Realms
          <FiArrowRight aria-hidden="true" />
        </Link>
      </article>
    </section>
  );
}
