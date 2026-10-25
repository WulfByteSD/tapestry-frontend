import Image from 'next/image';
import Link from 'next/link';
import { FiArrowDown, FiArrowUpRight } from 'react-icons/fi';
import { portalCtas } from '@/config/portal-navigation';
import styles from './HeroSection.module.scss';

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.art} aria-hidden="true">
        <Image src="/images/tapestry-story-scene.webp" alt="" fill priority sizes="(max-width: 720px) 100vw, 70vw" />
      </div>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>A narrative tabletop roleplaying game</p>
          <h1 id="home-title">Ordinary people.<br />Extraordinary<br /><em>stories.</em></h1>
          <p className={styles.lede}>Begin as someone ordinary. Let your choices, your companions, and a few Threads of fate change who you become.</p>
          <div className={styles.actions}>
            <Link href={portalCtas.getPlayersGuide.href} className={styles.primaryAction}>
              {portalCtas.getPlayersGuide.label}<FiArrowUpRight aria-hidden="true" />
            </Link>
            <a href="#how-it-plays" className={styles.secondaryAction}>See how it plays <FiArrowDown aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <p className={styles.caption}>Stories woven together. Fate and choice interlaced.</p>
    </section>
  );
}
