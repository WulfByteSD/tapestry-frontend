'use client';
import Link from 'next/link';
import type { BookPage } from './ResourceLibrary.types';
import { useEffect, useRef } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@tapestry/ui';
import { fetchBook, fetchBookPage, ResourceRequestError } from './ResourceLibrary.api';
import { BookShelf } from './BookShelf.component';
import { BookDetails } from './BookDetails.component';
import styles from './ResourceLibrary.module.scss';

export function ResourceLibrary({ initialPage }: { initialPage?: BookPage }) {
  const router = useRouter();
  const search = useSearchParams();
  const selectedSlug = search.get('book');
  const previousSelection = useRef<string | null>(null);
  const library = useInfiniteQuery({
    queryKey: ['portal-public-books'], initialPageParam: 1,
    initialData: initialPage ? { pages: [initialPage], pageParams: [1] } : undefined,
    queryFn: ({ pageParam }) => fetchBookPage(pageParam),
    getNextPageParam: (last) => last.page < last.pages ? last.page + 1 : undefined,
    retry: false, staleTime: 60000, meta: { suppressGlobalError: true },
  });
  const books = [...new Map((library.data?.pages.flatMap((page) => page.books) ?? []).map((book) => [book._id, book])).values()];
  books.sort((a, b) => {
    const rank = (book: typeof a) => book.kind === 'quickstart' ? 0 : book.key === 'tapestry-players-guide' ? 1 : 2;
    return rank(a) - rank(b);
  });
  const listedBook = books.find((book) => book.slug === selectedSlug);
  const detail = useQuery({
    queryKey: ['portal-public-book', selectedSlug], queryFn: () => fetchBook(selectedSlug!),
    enabled: Boolean(selectedSlug && !listedBook), retry: false,
    staleTime: 60000, meta: { suppressGlobalError: true },
  });
  const selectedBook = listedBook || detail.data;
  function selectBook(slug: string | null) {
    const params = new URLSearchParams(search.toString());
    if (slug && slug !== selectedSlug) params.set('book', slug); else params.delete('book');
    const query = params.toString();
    router.push('/resources' + (query ? '?' + query : '') + (query ? '#book-details' : '#collection'), { scroll: false });
  }
  useEffect(() => {
    if (selectedSlug) {
      const target = document.getElementById(selectedBook ? 'book-title' : 'book-details');
      target?.focus({ preventScroll: true });
      document.getElementById('book-details')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else if (previousSelection.current) {
      const book = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-book-slug]')).find((node) => node.dataset.bookSlug === previousSelection.current);
      (book || document.getElementById('collection'))?.focus();
    }
    previousSelection.current = selectedSlug;
  }, [selectedSlug, selectedBook]);
  return <section id="collection" tabIndex={-1} className={styles.collection} aria-labelledby="collection-title">
    <header className={styles.collectionHeading}><div><p className={styles.kicker}>The Tapestry bookshelf</p><h2 id="collection-title">Find your next <em>Thread.</em></h2></div><p>Free PDFs, ready for your table.<br />Choose a spine to take a closer look.</p></header>
    {library.isPending ? <p role="status" className={styles.state}>Opening the library…</p> : null}
    {library.isError && !books.length ? <div className={styles.state} role="status"><h3>The library is taking a moment.</h3><p>We couldn’t load the published books. Please try again.</p><Button type="button" onClick={() => library.refetch()} isLoading={library.isFetching}>Try again</Button></div> : null}
    {!library.isPending && !library.isError && !books.length ? <p className={styles.state} role="status">No free PDF editions are published here yet. Please check back soon.</p> : null}
    {books.length ? <BookShelf books={books} selectedSlug={selectedSlug} onSelect={selectBook} /> : null}
    {books.length ? <details className={styles.bookIndex}><summary>Browse book titles as a list</summary><ul>{books.map((book) => <li key={book._id}><Link href={'/resources/books/' + book.slug}>{book.title} ↗</Link></li>)}</ul></details> : null}
    {library.hasNextPage ? <div className={styles.loadMore}><Button type="button" variant="outline" isLoading={library.isFetchingNextPage} onClick={() => library.fetchNextPage()}>Show more books</Button>{library.isFetchNextPageError ? <p role="alert">More books couldn’t be loaded. Please try again.</p> : null}</div> : null}
    {selectedSlug ? <section id="book-details" tabIndex={-1} className={styles.details} aria-label="Selected book" onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); selectBook(null); } }}>
      <div className={styles.detailBar}><span>A closer look</span><Button type="button" variant="ghost" onClick={() => selectBook(null)}>Return to shelf ×</Button></div>
      {selectedBook ? <BookDetails key={selectedBook._id} book={selectedBook} /> : detail.isPending ? <p role="status">Opening the book…</p> : <div role="status"><h3>{detail.error instanceof ResourceRequestError && detail.error.status === 404 ? 'This edition is not available.' : 'We couldn’t open this book.'}</h3><p>Choose another published book, or try again.</p><Button type="button" onClick={() => detail.refetch()} isLoading={detail.isFetching}>Try again</Button></div>}
    </section> : null}
  </section>;
}
