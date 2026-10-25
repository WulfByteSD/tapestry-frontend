import styles from './Home.module.scss';
import { HeroSection } from './sections/hero/HeroSection';
import { BooksSection } from './sections/booksSection/BooksSection';
import { HowItPlaysSection } from './sections/hip/HowItPlaysSection';
import { DialsSection } from './sections/dials/DialsSection';
import { CommunitySection } from './sections/community/CommunitySection';

export function HomeFeature() {
  return (
    <main id="home-content" className={styles.page}>
      <a className={styles.skipLink} href="#books">Skip to the guides</a>
      <HeroSection />
      <BooksSection />
      <HowItPlaysSection />
      <DialsSection />
      <CommunitySection />
    </main>
  );
}
