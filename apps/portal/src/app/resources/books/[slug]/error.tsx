'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@tapestry/ui';
import styles from '@/features/resources/library/ResourceLibrary.module.scss';
export default function BookError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return <main className={styles.page}><div className={styles.inner}><h1>We couldn’t open this book.</h1><p>The library may be temporarily unavailable. Try again, or return to the bookshelf.</p><div className={styles.actions}><Button type="button" onClick={() => { reset(); router.refresh(); }}>Try again</Button><Link href="/resources">Back to the bookshelf</Link></div></div></main>;
}
