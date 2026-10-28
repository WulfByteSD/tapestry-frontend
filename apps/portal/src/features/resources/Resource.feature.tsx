import Link from 'next/link';
import { Suspense } from 'react';
import { fetchBookPage } from './library/ResourceLibrary.api';
import { ResourceLibrary } from './library/ResourceLibrary.component';
import styles from './library/ResourceLibrary.module.scss';

export async function ResourcesFeature() {
  const initialPage = await fetchBookPage().catch(() => undefined);
  return <main className={styles.page}>
    <a className={styles.skipLink} href="#collection">Skip to the bookshelf</a>
    <div className={styles.inner}>
      <header className={styles.intro} id="start-playing">
        <p className={styles.kicker}>Free guides. Stories waiting to happen.</p>
        <h1>Take a book.<br /><em>Begin a story.</em></h1>
        <p>Explore the public Quickstart Guide and Character Sheet for your next Tapestry session. Choose a book to see its current published edition.</p>
      </header>
      <Suspense fallback={<p role="status">Opening the library…</p>}><ResourceLibrary initialPage={initialPage} /></Suspense>
      <section className={styles.guidance} aria-label="Find your way into Tapestry">
        <article id="run-the-game"><div><p className={styles.kicker}>For Storyweavers</p><h2>Set the stakes.<br />Follow the choices.</h2></div><div><p>The Rules &amp; Rulings Guide is a paid book covering the core play loop. The Storyweaver’s Loom offers a framework for preparing stories around pressure and player choice.</p><p>Paid books are separate from the free downloads above.</p></div></article>
        <article id="explore-dials"><div><p className={styles.kicker}>Tone Modules</p><h2>The same Threads.<br />A different kind of story.</h2></div><div><p>Tone Modules adapt Tapestry to the story your table wants to tell—from gritty survival to romance and mythic stakes.</p></div></article>
        <article id="build-adversaries"><div><p className={styles.kicker}>The Unwoven</p><h2>A threat worth<br />telling stories about.</h2></div><div id="unwoven-compendium"><p>The Unwoven gives Storyweavers a modular approach to adversaries. The Adversary Compendium is a paid book for bringing threats to your table; it is separate from the free downloads above.</p></div></article>
        <article id="explore-worlds"><div><p className={styles.kicker}>A place to begin</p><h2>The Woven Realms</h2></div><div><p>Step into a world of frontier communities, rival banners and promises that leave their mark.</p><Link href="/settings/woven-realms">Explore the setting ↗</Link></div></article>
      </section>
    </div>
  </main>;
}
