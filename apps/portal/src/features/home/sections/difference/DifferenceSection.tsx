import { differenceCards, resultTrack } from './Difference.data';
import styles from './DifferenceSection.module.scss';

export function DifferenceSection() {
  return (
    <section id="difference" className={styles.section} aria-labelledby="difference-title">
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>What makes Tapestry different</p>
          <h2 id="difference-title">The rules are light. The consequences are not.</h2>
          <p className={styles.description}>
            Tapestry keeps the table moving with one memorable engine, then adds Threads, Dials, Looms, and role-aware tools so stories can grow without becoming rules-heavy.
          </p>
        </div>

        <aside className={styles.promisePanel} aria-label="Tapestry design promise">
          <p className={styles.panelLabel}>Design promise</p>
          <strong>Simple to start. Hard to outgrow.</strong>
          <p>Start with the core roll. Add deeper tools only when the story needs them.</p>
        </aside>
      </div>

      <div className={styles.showcase}>
        <article className={`${styles.card} ${styles.featureCard}`}>
          <p className={styles.cardEyebrow}>At the table</p>
          <div className={styles.featureCardCopy}>
            <h3>The system does not stop at pass or fail.</h3>
            <p>
              Every roll has a job: clarify what changes. Clean success, costly success, failure, and fate currency all keep the fiction moving instead of asking the table to wait
              for the next good roll.
            </p>
          </div>

          <div className={styles.resultTrack} aria-label="Tapestry roll outcomes">
            {resultTrack.map((result: any) => (
              <div key={result.label} className={styles.resultStep}>
                <span>{result.label}</span>
                <p>{result.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.card} ${styles.threadCard}`}>
          <p className={styles.cardEyebrow}>Why it matters</p>
          <h3>Failure becomes a resource instead of a dead end.</h3>
          <p>A bad roll should create pressure, not boredom. Threads give players a reason to stay bold even when the dice turn against them.</p>
        </article>
      </div>

      <div className={styles.grid}>
        {differenceCards.map((item) => (
          <article key={item.title} className={styles.card}>
            <div className={styles.cardTopline}>
              <p className={styles.cardEyebrow}>{item.eyebrow}</p>
              <div className={styles.metric} aria-label={`${item.metric.value}, ${item.metric.label}`}>
                <strong>{item.metric.value}</strong>
                <span>{item.metric.label}</span>
              </div>
            </div>

            <h3>{item.title}</h3>
            <p>{item.body}</p>

            <ul className={styles.bulletList}>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
