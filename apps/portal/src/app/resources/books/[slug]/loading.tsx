import styles from '@/features/resources/library/ResourceLibrary.module.scss';
export default function LoadingBook() { return <main className={styles.page}><div className={styles.inner}><p role="status">Opening the book…</p></div></main>; }
