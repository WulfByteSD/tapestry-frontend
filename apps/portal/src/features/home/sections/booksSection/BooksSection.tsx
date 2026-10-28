import Image from 'next/image';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
const playersGuideCover = 'https://res.cloudinary.com/wulfdev/image/upload/v1780602173/ChatGPT_Image_Jan_11_2026_08_38_15_PM_-_Copy_js6x3i.png';
import styles from './BooksSection.module.scss';

export function BooksSection() {


  return (
    <section id="books" tabIndex={-1} className={styles.section} aria-labelledby="books-title">
      <div className={styles.inner}>
        <Link href="/product/tapestry-players-guide" className={styles.coverLink} aria-label="Explore the Tapestry Player’s Guide">
          <Image src={playersGuideCover} alt="Tapestry Player’s Guide cover" width={500} height={750} sizes="(max-width: 720px) 180px, 280px" className={styles.cover} />
        </Link>
        <div className={styles.copy}>
          <p className={styles.kicker}>Your first Thread</p>
          <h2 id="books-title">A whole world of possibility.<br /><em>An open book.</em></h2>
          <p>Explore character creation, Threads, and growth through Weaves in the Player’s Guide. Find the current published edition alongside resources for your table.</p>
          <Link className={styles.action} href="/product/tapestry-players-guide">Explore the Player’s Guide <FiArrowUpRight aria-hidden="true" /></Link>
          <span className={styles.note}>Free catalogue title · Account required</span>
        </div>
      </div>
    </section>
  );
}
