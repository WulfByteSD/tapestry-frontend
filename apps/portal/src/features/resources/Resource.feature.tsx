import styles from './Resources.module.scss';
import { BuildAdversariesSection, ExploreDialsSection, ExploreWorldsSection, RunTheGameSection, StartPlayingSection } from './sections';

export function ResourcesFeature() {
  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <StartPlayingSection />
        <RunTheGameSection />
        <BuildAdversariesSection />
        <ExploreDialsSection />
        <ExploreWorldsSection />
      </div>
    </main>
  );
}
