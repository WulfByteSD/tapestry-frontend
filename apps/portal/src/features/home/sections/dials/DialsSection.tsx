import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import styles from './DialsSection.module.scss';

export function DialsSection() {
  return (
    <section id="discovery" className={styles.section} aria-labelledby="discovery-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.kicker}>Follow your curiosity</p>
          <h2 id="discovery-title">Find your kind<br />of <em>story.</em></h2>
          <p>A place to begin. A different tone. The tools to bring your own table together.</p>
        </div>
        <div className={styles.links}>
          <Link href="/settings/woven-realms" className={styles.entry}><div><span>Explore a setting</span><h3>The Woven Realms</h3><p>Enter a world of uneasy kingdoms, frontier villages, and promises that leave their mark.</p></div><FiArrowUpRight aria-hidden="true" /></Link>
          <Link href="/resources#explore-dials" className={styles.entry}><div><span>Change the tone</span><h3>Make the game your own</h3><p>Discover how Tone Modules bring romance, grit, or mythic stakes to the same core game.</p></div><FiArrowUpRight aria-hidden="true" /></Link>
          <Link href="/resources#run-the-game" className={styles.entry}><div><span>For Storyweavers</span><h3>Bring a story to the table</h3><p>Find the Rules &amp; Rulings Guide and the Storyweaver’s Loom to help shape what happens next.</p></div><FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
