'use client';

import { cubicBezier, motion, useReducedMotion } from 'framer-motion';

import { DiscordInviteButton } from './DiscordInviteButton';
import { communityCta, communityHighlights, communityPulseItems } from './CommunitySection.data';
import styles from './CommunitySection.module.scss';
import Image from 'next/image';

const revealTransition = { duration: 0.52, ease: cubicBezier(0.22, 1, 0.36, 1) };

export function CommunitySection() {
  const shouldReduceMotion = useReducedMotion();
  const discordAction = communityCta.actions.find((action) => action.variant === 'primary');
  const secondaryActions = communityCta.actions.filter((action) => action.variant !== 'primary');

  const revealProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: revealTransition,
      };

  return (
    <section id="community" className={styles.section} aria-labelledby="community-title">
      <motion.div className={styles.shell} {...revealProps}>
        <div className={styles.discordPanel}>
          <div className={styles.logoOrbit} aria-hidden="true">
            {communityCta.logoSrc ? (
              <Image src={communityCta.logoSrc} alt="" onError={(event) => event.currentTarget.remove()} width={100} height={100} />
            ) : (
              <span className={styles.logoFallback}>{communityCta.logoAlt.slice(0, 1)}</span>
            )}
          </div>

          <div className={styles.ctaCopy}>
            <p className={styles.kicker}>{communityCta.eyebrow}</p>
            <h2 id="community-title">{communityCta.title}</h2>
            <p className={styles.description}>{communityCta.description}</p>

            <div className={styles.actions} aria-label="Community actions">
              {discordAction ? <DiscordInviteButton href={discordAction.href} label={discordAction.label} logoSrc={communityCta.logoSrc} logoAlt={communityCta.logoAlt} /> : null}

              {secondaryActions.map((action) => {
                const isExternal = action.href.startsWith('http');

                return (
                  <a
                    key={action.label}
                    className={styles.secondaryAction}
                    href={action.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer' : undefined}
                  >
                    {action.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.sidePanel}>
          <p className={styles.panelLabel}>What lives there</p>
          <div className={styles.highlightGrid}>
            {communityHighlights.map((item, index) => (
              <motion.article
                key={item.title}
                className={styles.highlightCard}
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 18 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: '-80px' },
                      transition: { ...revealTransition, delay: index * 0.08 },
                    })}
              >
                <span>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </motion.article>
            ))}
          </div>
        </div>

        <div className={styles.pulsePanel} aria-labelledby="community-pulse-title">
          <div className={styles.pulseHeader}>
            <p className={styles.panelLabel}>
              The Loom Pulse
            </p>
            <h3 id="community-pulse-title">
              What's being woven right now
            </h3>
          </div>

          <div className={styles.pulseList}>
            {communityPulseItems.map((item) => (
              <article key={item.title} className={styles.pulseItem}>
                <span>{item.label}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
