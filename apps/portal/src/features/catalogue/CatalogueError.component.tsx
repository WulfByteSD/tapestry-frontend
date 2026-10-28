'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Catalogue.module.scss';
export default function CatalogueErrorView({ reset }: { reset: () => void }) {
  const router = useRouter();
  return <main className={styles.page}><div className={styles.inner}><p className={styles.kicker}>The Tapestry catalogue</p><h1>We couldn’t open the catalogue.</h1>
    <p role="alert">The book list is temporarily unavailable. Try again, or explore the current free downloads.</p>
    <div className={styles.actions}><button type="button" onClick={() => { reset(); router.refresh(); }}>Try again</button><Link href="/resources#collection">Free downloads</Link><Link href="/shop">Back to the catalogue</Link></div>
  </div></main>;
}
