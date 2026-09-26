import { motion, useReducedMotion } from 'framer-motion';

import styles from './DiscordInviteButton.module.scss';
import Image from 'next/image';

type DiscordInviteButtonProps = {
  href: string;
  label: string;
  logoSrc: string;
  logoAlt?: string;
};

export function DiscordInviteButton({ href, label, logoSrc, logoAlt = 'Discord' }: DiscordInviteButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const isExternal = href.startsWith('http');

  return (
    <motion.a
      className={styles.button}
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      aria-label={`${label} — opens Discord`}
      whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.015 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <span className={styles.glow} aria-hidden="true" />
      <span className={styles.sparkOne} aria-hidden="true" />
      <span className={styles.sparkTwo} aria-hidden="true" />

      <span className={styles.logoBadge} aria-hidden="true">
        <span className={styles.logoPulse} />
        <Image src={logoSrc} alt="" onError={(event) => event.currentTarget.remove()} width={48} height={48} />
        <span className={styles.logoFallback}>{logoAlt.slice(0, 1)}</span>
      </span>

      <span className={styles.copy}>
        <span className={styles.eyebrow}>Discord community</span>
        <span className={styles.label}>{label}</span>
      </span>

      <span className={styles.arrow} aria-hidden="true">
        <span />
      </span>
    </motion.a>
  );
}
