'use client';
import Image from 'next/image';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { createShelfGesture } from './BookShelf.gesture';
import type { PublicBook } from './ResourceLibrary.types';
import { safeImageUrl } from './ResourceLibrary.api';
import styles from './BookShelf.module.scss';

function ShelfBook({ book, selected, preview, gesture, onSelect, index }: { book: PublicBook; selected: boolean; preview: boolean; gesture: ReturnType<typeof createShelfGesture>; onSelect: (slug: string) => void; index: number }) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const cover = safeImageUrl(book.presentation?.coverImageUrl);
  const spine = safeImageUrl(book.presentation?.spineImageUrl);
  const colors = ['#392144', '#29433e', '#5d302b', '#263c54', '#584324'];
  return <button type="button" className={styles.book} data-selected={selected} data-preview={preview}
    data-book-slug={book.slug} aria-label={book.title} aria-expanded={selected}
    aria-controls={selected ? 'book-details' : undefined}
    style={{ '--book-color': colors[index % colors.length] } as CSSProperties}
    onPointerDown={(event) => gesture.start(book.slug, event)}
    onContextMenu={(event) => { if (gesture.blocksContextMenu()) event.preventDefault(); }}
    onClick={(event) => {
      if (gesture.consumeClick(book.slug, event.detail)) { event.preventDefault(); event.stopPropagation(); return; }
      gesture.dismiss();
      onSelect(book.slug);
    }}>
    <span className={styles.volume} aria-hidden="true">
      <span className={styles.spine}>
        {spine && !failedImages.includes(spine) ? <Image unoptimized width={64} height={260} src={spine} alt="" draggable={false} onError={() => setFailedImages((current) => [...current, spine])} /> : null}
        <span className={styles.spineBrand}>T</span><strong>{book.title}</strong><span className={styles.spineFoot}>TAPESTRY</span>
      </span>
      <span className={styles.cover}><span className={styles.coverType}>TAPESTRY</span><strong>{book.title}</strong><span>Stories woven together</span>
        {cover && !failedImages.includes(cover) ? <Image unoptimized width={500} height={750} src={cover} alt="" loading="lazy" draggable={false} onError={() => setFailedImages((current) => [...current, cover])} /> : null}
      </span><span className={styles.pages} />
    </span>
    <span className={styles.label} aria-hidden="true">{book.title}</span>
  </button>;
}
export function BookShelf({ books, selectedSlug, onSelect }: { books: PublicBook[]; selectedSlug: string | null; onSelect: (slug: string) => void }) {
  const hintId = useId();
  const shelf = useRef<HTMLDivElement>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [gesture] = useState(() => createShelfGesture(setPreviewSlug));
  useEffect(() => {
    const move = (event: PointerEvent) => gesture.move(event);
    const end = (event: PointerEvent) => gesture.end(event.pointerId);
    const cancel = (event: PointerEvent) => gesture.cancel(event.pointerId);
    const outside = (event: PointerEvent | FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !shelf.current?.contains(target) || !target.closest('[data-book-slug]')) gesture.dismiss();
    };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape' || event.key === 'Tab') gesture.dismiss(); };
    // No pointer capture/preventDefault: the browser retains native swipe/pan handling.
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('focusin', outside);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('scroll', gesture.dismiss, true);
    window.addEventListener('blur', gesture.dismiss);
    document.addEventListener('keydown', key);
    return () => {
      gesture.dispose();
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('focusin', outside);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('scroll', gesture.dismiss, true);
      window.removeEventListener('blur', gesture.dismiss);
      document.removeEventListener('keydown', key);
    };
  }, [gesture]);
  return <div className={styles.shelf} ref={shelf}>
    <div className={styles.viewport} role="group" aria-label="Published Tapestry books" aria-describedby={hintId}>
      <div className={styles.contents}>
        <ul className={styles.row}>{books.map((book, index) => <li key={book._id}><ShelfBook book={book} selected={selectedSlug === book.slug} preview={previewSlug === book.slug} gesture={gesture} onSelect={onSelect} index={index} /></li>)}</ul>
        <div className={styles.plank} aria-hidden="true" />
      </div>
    </div>
    <p className={styles.hint} id={hintId}>Touch and hold a spine to pull it out, then tap to open. Tap elsewhere or swipe to put it back. Use Tab and Enter with a keyboard.</p>
  </div>;
}
