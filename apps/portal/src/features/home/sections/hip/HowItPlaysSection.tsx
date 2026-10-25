import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import styles from './HowItPlaysSection.module.scss';

export function HowItPlaysSection() {
  return (
    <section id="how-it-plays" className={styles.section} aria-labelledby="how-it-plays-title">
      <div className={styles.intro}>
        <p className={styles.kicker}>A moment at the table</p>
        <h2 id="how-it-plays-title">A bad roll.<br /><em>A new possibility.</em></h2>
        <p>In Tapestry, a setback can give you something to carry into your next bold choice.</p>
        <Link href="/resources#start-playing" className={styles.link}>Learn the core rules <FiArrowUpRight aria-hidden="true" /></Link>
      </div>
      <ol className={styles.story}>
        <li><span className={styles.number} aria-hidden="true">01</span><div><h3>Begin with someone ordinary.</h3><p>Rowan is a blacksmith’s apprentice facing a marauding beast. They choose to stand and fight.</p></div></li>
        <li><span className={styles.number} aria-hidden="true">02</span><div><h3>Let failure change the scene.</h3><p>The attack misses. The beast is still standing, but Rowan gains a Thread: fate has given them something to work with.</p></div></li>
        <li><span className={styles.number} aria-hidden="true">03</span><div><h3>Pull on fate.</h3><p>Later, Rowan spends that Thread for an Edge on a roll. A stumble becomes a chance to turn the fight.</p></div></li>
      </ol>
    </section>
  );
}
