'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { dialKnobs, dialTypes, featuredDial, stableEngineItems, usageSteps } from './DialsSection.data';
import styles from './DialsSection.module.scss';

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

export function DialsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="dials" className={styles.section} aria-labelledby="dials-title">
      <motion.div className={styles.header} {...getRevealProps(shouldReduceMotion)}>
        <p className={styles.kicker}>Dials</p>
        <div className={styles.headingRow}>
          <h2 id="dials-title">Same engine. Different pressure.</h2>
          <p className={styles.description}>
            A Dial is a modular rules packet that tunes how Tapestry feels at the table. It does not replace the core roll. It adjusts what failure costs, how resources flow, and
            what kind of moments the story keeps spotlighting.
          </p>
        </div>
      </motion.div>

      <div className={styles.dialWorkbench}>
        <motion.article className={styles.engineCard} {...getRevealProps(shouldReduceMotion, 0.08)}>
          <p className={styles.panelLabel}>The locked core</p>
          <h3>The rules underneath stay familiar.</h3>
          <p>Dials sit on top of the same play loop, so a table can move from grim survival to romance, mythic fantasy, or mystery without relearning the whole game.</p>

          <ul className={styles.engineList} aria-label="Core rules that stay stable when a Dial is active">
            {stableEngineItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.article>

        <motion.div className={styles.knobPanel} {...getRevealProps(shouldReduceMotion, 0.14)}>
          <div className={styles.knobHeader}>
            <p className={styles.panelLabel}>What a Dial tunes</p>
            <span aria-hidden="true">✦</span>
          </div>

          <div className={styles.knobStack}>
            {dialKnobs.map((knob, index) => (
              <article key={knob.label} className={styles.knobCard}>
                <div className={styles.knobVisual} aria-hidden="true">
                  <span style={{ transform: `rotate(${-34 + index * 34}deg)` }} />
                </div>

                <div>
                  <div className={styles.knobTitleRow}>
                    <h3>{knob.label}</h3>
                    <span>{knob.range}</span>
                  </div>
                  <p>{knob.body}</p>
                </div>
              </article>
            ))}
          </div>
        </motion.div>
      </div>

      <div className={styles.supportGrid}>
        <motion.div className={styles.typeGrid} {...getRevealProps(shouldReduceMotion, 0.08)}>
          {dialTypes.map((dialType) => (
            <article key={dialType.title} className={styles.typeCard}>
              <p>{dialType.eyebrow}</p>
              <h3>{dialType.title}</h3>
              <span>{dialType.body}</span>
              <ul aria-label={`${dialType.title} examples`}>
                {dialType.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </motion.div>

        <motion.article className={styles.exampleCard} {...getRevealProps(shouldReduceMotion, 0.16)}>
          <p className={styles.panelLabel}>A Dial in motion</p>
          <h3>{featuredDial.title}</h3>
          <p>{featuredDial.body}</p>
          <div className={styles.tagRow} aria-label="Featured Dial highlights">
            {featuredDial.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </motion.article>
      </div>

      <motion.ol className={styles.usageRail} {...getRevealProps(shouldReduceMotion, 0.18)}>
        {usageSteps.map((step, index) => (
          <li key={step.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </motion.ol>
    </section>
  );
}
