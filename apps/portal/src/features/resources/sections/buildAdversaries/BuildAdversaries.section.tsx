'use client';

import { FiArrowUpRight, FiBookOpen, FiCrosshair, FiShield } from 'react-icons/fi';

import { useFetchResource } from '../../hooks/useFetchResource';
import {
  adversaryBuilderResource,
  adversaryCompendiumResource,
  adversaryPillars,
  adversaryResourceSlugs,
  withFetchedResource,
} from './BuildAdversaries.data';
import styles from './BuildAdversaries.module.scss';

export function BuildAdversariesSection() {
  const { resource: builderResourceFromServer } = useFetchResource(adversaryResourceSlugs.builder);
  const { resource: compendiumResourceFromServer } = useFetchResource(adversaryResourceSlugs.compendium);

  const builderResource = withFetchedResource(adversaryBuilderResource, builderResourceFromServer);
  const compendiumResource = withFetchedResource(adversaryCompendiumResource, compendiumResourceFromServer);

  return (
    <section id="build-adversaries" className={styles.section} aria-labelledby="build-adversaries-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Adversaries</p>
          <h2 id="build-adversaries-title">Skin a new threat fast, or drop in a proven one.</h2>
        </div>

        <p className={styles.description}>
          In Tapestry, building adversaries is about getting pressure on the table quickly. The system guide helps Storyweavers create something fresh on the fly. The compendium gives
          you approved Unwoven that can be dropped into almost any play space.
        </p>
      </header>

      <div className={styles.pillarGrid}>
        {adversaryPillars.map((pillar) => (
          <article key={pillar.title} className={styles.pillarCard}>
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.cardGrid}>
        <article className={styles.resourceCard}>
          <div className={styles.resourceHeader}>
            <div className={styles.iconBadge} aria-hidden="true">
              <FiCrosshair />
            </div>

            <div>
              <p>{builderResource.eyebrow}</p>
              <h3>{builderResource.title}</h3>
            </div>
          </div>

          <p className={styles.resourceBody}>{builderResource.description}</p>

          <ul className={styles.detailList} aria-label={`${builderResource.title} highlights`}>
            {builderResource.detailList.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          {builderResource.href ? (
            <a className={styles.primaryAction} href={builderResource.href} target="_blank" rel="noreferrer">
              {builderResource.hrefLabel}
              <FiArrowUpRight aria-hidden="true" />
            </a>
          ) : (
            <span className={styles.pendingAction}>{builderResource.pendingLabel}</span>
          )}
        </article>

        <article className={styles.resourceCard}>
          <div className={styles.resourceHeader}>
            <div className={styles.iconBadge} aria-hidden="true">
              <FiBookOpen />
            </div>

            <div>
              <p>{compendiumResource.eyebrow}</p>
              <h3>{compendiumResource.title}</h3>
            </div>
          </div>

          <p className={styles.resourceBody}>{compendiumResource.description}</p>

          <ul className={styles.detailList} aria-label={`${compendiumResource.title} highlights`}>
            {compendiumResource.detailList.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          {compendiumResource.href ? (
            <a className={styles.primaryAction} href={compendiumResource.href} target="_blank" rel="noreferrer">
              {compendiumResource.hrefLabel}
              <FiArrowUpRight aria-hidden="true" />
            </a>
          ) : (
            <span className={styles.pendingAction}>{compendiumResource.pendingLabel}</span>
          )}
        </article>
      </div>

      <aside className={styles.noteCard} aria-label="Adversary guidance">
        <div className={styles.noteIcon} aria-hidden="true">
          <FiShield />
        </div>

        <div>
          <h3>How these two pieces work together</h3>
          <p>
            Reach for the system guide when the party turns down an unexpected path and you need a threat immediately. Reach for the compendium when you want a Tapestry-approved creature
            that already carries the right kind of scene pressure.
          </p>
        </div>
      </aside>
    </section>
  );
}
