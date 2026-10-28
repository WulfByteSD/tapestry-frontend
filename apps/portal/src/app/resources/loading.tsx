import styles from '@/features/resources/library/ResourceLibrary.module.scss';
export default function LoadingResources() { return <main className={styles.page}><div className={styles.inner}><h1>The Tapestry bookshelf</h1><p role="status">Opening the library…</p></div></main>; }
