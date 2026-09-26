import { FiCompass, FiHeart, FiSliders, FiTrendingUp } from 'react-icons/fi';

import { dialLevers, dialTypes, featuredDials } from './ExploreDials.data';
import styles from './ExploreDials.module.scss';

const dialIcons = [FiCompass, FiHeart, FiTrendingUp] as const;

export function ExploreDialsSection() {
  return (
    <section id="explore-dials" className={styles.section} aria-labelledby="explore-dials-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Explore dials</p>
          <h2 id="explore-dials-title">Keep the engine. Change the pressure.</h2>
        </div>

        <p className={styles.description}>
          Dials do not replace the Tapestry core roll. They tune how the story feels. Some simply color the narration. Others add a lightweight rules layer when the table wants the tone to
          matter mechanically.
        </p>
      </header>

      <div className={styles.frameworkGrid}>
        <article className={styles.frameworkCard}>
          <div className={styles.frameworkIcon} aria-hidden="true">
            <FiSliders />
          </div>

          <div>
            <p className={styles.panelLabel}>Dial framework</p>
            <h3>Every dial should touch something players can feel.</h3>
            <p>
              The canon treats a dial as a lens over the existing system. If it does not shift Threads, fallout, spotlight, or another repeating pressure in play, it is not really a dial
              yet.
            </p>
          </div>
        </article>

        <div className={styles.typeGrid}>
          {dialTypes.map((dialType) => (
            <article key={dialType.title} className={styles.typeCard}>
              <p>{dialType.eyebrow}</p>
              <h3>{dialType.title}</h3>
              <span>{dialType.body}</span>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.leverGrid}>
        {dialLevers.map((lever) => (
          <article key={lever.title} className={styles.leverCard}>
            <h3>{lever.title}</h3>
            <p>{lever.body}</p>
          </article>
        ))}
      </div>

      <div className={styles.showcaseGrid}>
        {featuredDials.map((dial, index) => {
          const Icon = dialIcons[index] ?? FiCompass;

          return (
            <article key={dial.title} className={styles.showcaseCard}>
              <div className={styles.showcaseHeader}>
                <div className={styles.showcaseIcon} aria-hidden="true">
                  <Icon />
                </div>

                <div>
                  <p>{dial.designation}</p>
                  <h3>{dial.title}</h3>
                </div>
              </div>

              <p className={styles.showcaseBody}>{dial.description}</p>

              <ul className={styles.tagList} aria-label={`${dial.title} details`}>
                {dial.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
