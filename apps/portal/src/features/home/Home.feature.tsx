import styles from './Home.module.scss';
import {
  BooksSection,
  CommunitySection,
  DifferenceSection,
  DialsSection,
  HeroSection,
  HowItPlaysSection,
  PlaytestInfoSection,
} from './sections';

export function HomeFeature() {
  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <HeroSection />
        <DifferenceSection />
        <HowItPlaysSection />
        <DialsSection />
        <BooksSection />
        <CommunitySection />
        {/* <PlaytestInfoSection /> */}
      </div>
    </main>
  );
}
