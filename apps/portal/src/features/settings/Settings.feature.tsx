import Link from 'next/link';
import { wovenRealmsEntryPoints, wovenRealmsHighlights, wovenRealmsSourcebooks } from './settings.data';
import styles from './Settings.module.scss';

export function SettingsFeature() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#everpine">Skip to Everpine</a>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.kicker}>The Woven Realms</p>
          <h1>A village. A vow.<br /><em>A choice that matters.</em></h1>
          <p className={styles.lede}>Begin among frontier communities, rival banners and promises that leave their mark. In the Woven Realms, ordinary lives become part of a much larger story.</p>
          <Link className={styles.action} href="/resources#collection">Explore the published books <span aria-hidden="true">&rarr;</span></Link>
        </header>
        <section className={styles.world} aria-labelledby="world-title">
          <div><p className={styles.kicker}>A world that remembers</p><h2 id="world-title">Every choice<br />leaves a Thread.</h2></div>
          <div>
            <p>Fate is woven into the landscape. Oaths, kindnesses and failures leave traces that outlast the people who made them. A village can carry the memory of a broken promise as surely as a kingdom.</p>
            <ul>{wovenRealmsHighlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          </div>
        </section>
        <section id="everpine" tabIndex={-1} className={styles.everpine} aria-labelledby="everpine-title">
          <p className={styles.kicker}>Your first foothold</p>
          <h2 id="everpine-title">Begin in Everpine.</h2>
          <p className={styles.lede}>{wovenRealmsEntryPoints[0].description}</p>
          <p>The Clearstream powers its mills and feeds its fields. The mountain road brings trade, but also refugees, mercenaries and pressure from distant powers. Neutrality is a promise the village has to keep making.</p>
          <p className={styles.prompt}>Start with people who call this place home. What will they risk to keep it standing?</p>
        </section>
        <section className={styles.pressures} aria-labelledby="pressures-title">
          <div className={styles.sectionHeading}><p className={styles.kicker}>Beyond the village</p><h2 id="pressures-title">The wider world pulls at every promise.</h2></div>
          {wovenRealmsEntryPoints.slice(1).map((entry) => <article key={entry.title}>
            <h3>{entry.title}</h3><p>{entry.description}</p>
          </article>)}
        </section>
        <section className={styles.sources} aria-labelledby="sources-title">
          <div><p className={styles.kicker}>Read further</p><h2 id="sources-title">The stories behind the setting.</h2>
            <p>This introduction draws on <cite>The Woven Realms — World Lore</cite> and <cite>The Woven Realms — Everpine</cite>. Find available editions in the published book library.</p>
            <Link className={styles.action} href="/resources#collection">Browse the bookshelf <span aria-hidden="true">&rarr;</span></Link>
          </div>
          <ol>{wovenRealmsSourcebooks.map((book) => <li key={book.slug}><h3>{book.title}</h3><p>{book.summary}</p></li>)}</ol>
        </section>
      </div>
    </main>
  );
}
