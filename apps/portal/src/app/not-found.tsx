import Link from 'next/link';
import styles from '@/features/resources/library/ResourceLibrary.module.scss';

export default function NotFound() {
  return <main className={styles.page}><div className={styles.inner}>
    <p className={styles.kicker}>A Thread to follow</p>
    <h1>This page could not be found.</h1>
    <p>The address may have changed. Find the published books or begin again at home.</p>
    <p><Link className={styles.backLink} href="/resources#collection">Explore the bookshelf</Link></p>
    <Link className={styles.backLink} href="/">Return to Tapestry</Link>
  </div></main>;
}
