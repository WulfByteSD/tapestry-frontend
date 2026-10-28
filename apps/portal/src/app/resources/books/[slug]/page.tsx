import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { fetchBook, ResourceRequestError } from '@/features/resources/library/ResourceLibrary.api';
import { BookDetails } from '@/features/resources/library/BookDetails.component';
import { createRouteMetadata } from '@/lib/route-metadata';
import styles from '@/features/resources/library/ResourceLibrary.module.scss';

const loadBook = cache(fetchBook);
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const book = await loadBook(slug);
    return createRouteMetadata({ title: book.title + ' | Tapestry', description: (book.summary || book.description || 'Read and download this published Tapestry PDF.').slice(0, 180), path: '/resources/books/' + book.slug, robots: { index: true, follow: true } });
  } catch { return { title: 'Book unavailable | Tapestry', robots: { index: false, follow: false } }; }
}
export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await loadBook(slug).catch((error) => { if (error instanceof ResourceRequestError && error.status === 404) notFound(); throw error; });
  return <main className={styles.page}><div className={styles.inner}><Link className={styles.backLink} href={'/resources?book=' + book.slug + '#book-details'}>← Back to the bookshelf</Link><article className={styles.details}><BookDetails book={book} standalone /></article></div></main>;
}
