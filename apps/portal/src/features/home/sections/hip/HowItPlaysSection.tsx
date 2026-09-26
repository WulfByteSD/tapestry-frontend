'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { howItPlaysSteps, outcomeBands, playLoopStats } from './HowItPlaysSection.data';
import styles from './HowItPlaysSection.module.scss';

const getRevealProps = (shouldReduceMotion: boolean | null, delay = 0) =>
  shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.22 },
        transition: {
          duration: 0.55,
          delay,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };

export function HowItPlaysSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="how-it-plays" className={styles.section} aria-labelledby="how-it-plays-title">
      <motion.div className={styles.header} {...getRevealProps(shouldReduceMotion)}>
        <p className={styles.kicker}>How it plays</p>
        <div className={styles.headingRow}>
          <h2 id="how-it-plays-title">A table loop that keeps the story moving.</h2>
          <p className={styles.description}>
            Tapestry does not ask the table to hunt for the right rule before the story can continue. Frame the pressure, choose an approach, roll when it matters, and let the result change the scene.
          </p>
        </div>
      </motion.div>

      <div className={styles.loopShell}>
        <motion.aside className={styles.scenePanel} {...getRevealProps(shouldReduceMotion, 0.08)}>
          <div className={styles.panelChrome}>
            <span>Example scene</span>
            <span>TN 11</span>
          </div>

          <p className={styles.sceneEyebrow}>Set the pressure</p>
          <h3>The chapel is half-collapsed. The cultist is almost through the fog.</h3>
          <p>
            Move fast and you can catch him before he escapes. Move loud and the whole room turns on you. The Storyweaver frames the pressure. The player chooses the move.
          </p>

          <div className={styles.rollFormula} aria-label="Roll three six-sided dice plus approach plus skill against the target number">
            <span>3d6</span>
            <span>+</span>
            <span>Approach</span>
            <span>+</span>
            <span>Skill</span>
            <span>vs TN</span>
          </div>

          <div className={styles.outcomeRail} aria-label="Tapestry result bands">
            {outcomeBands.map((outcome) => (
              <div key={outcome.name} className={styles.outcomeItem}>
                <div>
                  <strong>{outcome.name}</strong>
                  <span>{outcome.range}</span>
                </div>
                <p>{outcome.detail}</p>
              </div>
            ))}
          </div>
        </motion.aside>

        <ol className={styles.stepsList}>
          {howItPlaysSteps.map((step, index) => (
            <motion.li
              key={step.title}
              className={styles.stepItem}
              {...getRevealProps(shouldReduceMotion, 0.12 + index * 0.08)}
            >
              <div className={styles.stepMarker} aria-hidden="true">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <article className={styles.stepCard}>
                <p className={styles.stepKicker}>{step.kicker}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>

                <p className={styles.tableCue}>
                  <span>Table cue</span>
                  {step.cue}
                </p>

                <ul className={styles.tagList} aria-label={`${step.title} highlights`}>
                  {step.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            </motion.li>
          ))}
        </ol>
      </div>

      <motion.div className={styles.loopSummary} {...getRevealProps(shouldReduceMotion, 0.16)}>
        {playLoopStats.map((stat) => (
          <article key={stat.label} className={styles.summaryCard}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.description}</span>
          </article>
        ))}
      </motion.div>
    </section>
  );
}
