import Image from 'next/image';
import Link from 'next/link';
import { portalCtas } from '@/config/portal-navigation';
import styles from './HeroSection.module.scss';

const secondaryCallToAction = {
  label: 'Contact',
  href: 'mailto:hello@tapestry-ttrpg.com',
} as const;

const videoSrc = 'https://res.cloudinary.com/wulfdev/video/upload/v1780601263/TapestryStories_llb3ac.mp4';

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.media} aria-hidden="true">
        <video className={styles.video} autoPlay loop muted playsInline preload="none" src={videoSrc} />
        <div className={styles.orb} />
        <div className={styles.mesh} />
      </div>

      <div className={styles.panel}>
        <div className={styles.content}>
          <div className={styles.brandMark}>
            <Image
              className={styles.brandImage}
              src="https://res.cloudinary.com/wulfdev/image/upload/v1780602173/ChatGPT_Image_Jan_10_2026_11_32_39_AM_-_Copy_j55058.png"
              alt="Tapestry logo"
              width={400}
              height={400}
              sizes="(max-width: 720px) 40vw, 22vw"
            />
          </div>
          <h1 id="home-title">Stories woven through the Threads of Fate</h1>
        </div>
        <p className={styles.lede}>
          Tapestry is a digital platform for tabletop role-playing games, designed to enhance the storytelling experience and empower players and game masters alike.
        </p>

        <div className={styles.actions}>
          <Link href={portalCtas.getPlayersGuide.href} className={styles.primaryAction}>
            {portalCtas.getPlayersGuide.label}
          </Link>

          <a className={styles.secondaryAction} href={secondaryCallToAction.href}>
            {secondaryCallToAction.label}
          </a>
        </div>
      </div>
    </section>
  );
}
