import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { portalCtas } from '@/config/portal-navigation';
const playersGuideCover = 'https://res.cloudinary.com/wulfdev/image/upload/v1780602173/ChatGPT_Image_Jan_11_2026_08_38_15_PM_-_Copy_js6x3i.png';
import styles from './BooksSection.module.scss';

export function BooksSection() {


  return (
    <section id="books" tabIndex={-1} className={styles.section} aria-labelledby="books-title">
      <div className={styles.inner}>
        <Link href={portalCtas.getPlayersGuide.href} className={styles.coverLink} aria-label="Explore the Tapestry Player’s Guide and Quickstart">
          <Image src={playersGuideCover} alt="Tapestry Player’s Guide cover" width={500} height={750} sizes="(max-width: 720px) 180px, 280px" className={styles.cover} />
        </Link>
        <div className={styles.copy}>
          <p className={styles.kicker}>Your first Thread</p>
          <h2 id="books-title">A whole world of possibility.<br /><em>An open book.</em></h2>
          <p>Meet the game through the free Quickstart, or explore character creation, Threads, and growth through Weaves in the Player’s Guide.</p>
          <Link className={styles.action} href={portalCtas.getPlayersGuide.href}>Explore the free guides <FiArrowUpRight aria-hidden="true" /></Link>
          <span className={styles.note}>Quickstart &amp; Player’s Guide · Free PDFs</span>
        </div>
      </div>
    </section>
  );
}
