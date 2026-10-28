import Link from 'next/link';
import styles from '@/features/resources/library/ResourceLibrary.module.scss';
export default function BookNotFound() { return <main className={styles.page}><div className={styles.inner}><h1>This edition is not available.</h1><p>It may have moved or is no longer published.</p><Link className={styles.backLink} href="/resources">Return to the bookshelf</Link></div></main>; }
