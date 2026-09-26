import styles from './PlaytestInfoSection.module.scss';

const playtestNotes = [
  {
    title: 'Current state',
    body: 'There is no active playtest program information to publish yet, so this section is intentionally informational and non-committal.',
  },
  {
    title: 'What this block is for',
    body: 'It reserves a stable location for future playtest dates, guidance, eligibility notes, and version-specific materials.',
  },
  {
    title: 'How it can evolve',
    body: 'Later, this structure can support timelines, FAQ links, or sign-up flows without changing the home page composition again.',
  },
];

export function PlaytestInfoSection() {
  return (
    <section id="playtest" className={styles.section} aria-labelledby="playtest-title">
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.kicker}>Playtest information</p>
          <h2 id="playtest-title">An informational block now, a release utility later.</h2>
          <p className={styles.description}>There is no live playtest program to wire up today. This section exists so that information has a credible place to land when that changes.</p>
        </div>

        <div className={styles.grid}>
          {playtestNotes.map((note) => (
            <article key={note.title} className={styles.noteCard}>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}