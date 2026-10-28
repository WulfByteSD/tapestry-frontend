'use client';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { safeImageUrl } from './ResourceLibrary.api';
import type { PublicBook } from './ResourceLibrary.types';
import { DownloadPdf } from './DownloadPdf.component';
import styles from './ResourceLibrary.module.scss';

export function BookDetails({ book, standalone = false }: { book: PublicBook; standalone?: boolean }) {
  const [failedCover, setFailedCover] = useState(false);
  const cover = safeImageUrl(book.presentation?.coverImageUrl);
  const Heading = standalone ? 'h1' : 'h2';
  return <div className={styles.detailsGrid}>
    <div className={styles.detailCover}>
      {cover && !failedCover ? <Image unoptimized width={500} height={750} src={cover} alt={book.title + ' cover'} onError={() => setFailedCover(true)} /> : <div className={styles.fallbackCover}><span>TAPESTRY</span><strong>{book.title}</strong><span>Stories woven together</span></div>}
    </div>
    <div className={styles.detailCopy}>
      <p className={styles.kicker}>{book.kind || 'From the library'} · Free PDF</p>
      <Heading id="book-title" tabIndex={-1}>{book.title}</Heading>
      {book.subtitle ? <p className={styles.subtitle}>{book.subtitle}</p> : null}
      {book.authors?.length ? <p className={styles.byline}>By {book.authors.join(', ')}</p> : null}
      <p className={styles.bookDescription}>{book.description || book.summary || 'Open the published PDF to explore this Tapestry resource.'}</p>
      {book.currentRelease?.version ? <p className={styles.byline}>Edition {book.currentRelease.version}{book.currentRelease.sizeBytes ? ' · ' + (book.currentRelease.sizeBytes / 1048576).toFixed(1) + ' MB' : ''}</p> : null}
      <DownloadPdf key={book._id} book={book} />
      {!standalone ? <Link href={'/resources/books/' + book.slug} className={styles.permalink}>Open book page <span aria-hidden="true">↗</span></Link> : null}
    </div>
  </div>;
}
