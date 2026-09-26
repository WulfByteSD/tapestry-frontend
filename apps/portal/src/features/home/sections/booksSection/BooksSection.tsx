import type { CSSProperties } from 'react';
import { InteractiveBook } from '@tapestry/ui';
import { bookDisplaySizes, booksPerShelf, featuredBooks } from './BooksSection.data';
import { chunkBooksIntoShelves } from './BooksSection.helpers';
import styles from './BooksSection.module.scss';

const bookcaseStyle = {
  '--book-width': bookDisplaySizes.width,
  '--book-height': bookDisplaySizes.height,
  '--book-spine-width': bookDisplaySizes.spineWidth,
} as CSSProperties;

export function BooksSection() {
  const shelves = chunkBooksIntoShelves(featuredBooks, booksPerShelf);
  const shelfLabel = shelves.length === 1 ? 'shelf' : 'shelves';

  return (
    <section id="books" className={styles.section} aria-labelledby="books-title">
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <p className={styles.kicker}>Get the books</p>
          <h2 id="books-title">Pull a volume from the Tapestry shelf.</h2>
          <p className={styles.description}>
            The books are the artifacts of the system: core play, table rulings, and preview material 
            are all available for free. Each book is a different window into the world of Tapestry, and the shelf is always growing.
          </p>
        </div>

        <aside className={styles.shelfNote} aria-label="Bookshelf note">
          <span className={styles.shelfNoteLabel}>Shelf state</span>
          <p>
            The books on this shelf are in various stages of development, but all are available for free. The Players Core Book is the most complete, with the full rules and player-facing guidance. The Rules and Rulings Guide is a practical reference for running the core engine at the table. The Playtest Packet is a lighter entry point for groups that want to test the feel of Tapestry before committing to the full shelf.
          </p>
        </aside>
      </div>

      <div className={styles.bookcase} style={bookcaseStyle} aria-label="Featured Tapestry books shelf">
        <div className={styles.bookcaseHeader}>
          <span>Featured shelf</span>
          <strong>
            {featuredBooks.length} volumes / {shelves.length} {shelfLabel}
          </strong>
        </div>

        <div className={styles.shelves}>
          {shelves.map((shelf, shelfIndex) => (
            <div
              key={`shelf-${shelfIndex}`}
              className={styles.shelfGroup}
              aria-label={`Shelf ${shelfIndex + 1}`}
            >
              <div className={styles.shelfLabel}>
                <span>Shelf {String(shelfIndex + 1).padStart(2, '0')}</span>
                <strong>{shelf.length} volumes</strong>
              </div>

              <div className={styles.shelfRail} role="list">
                {shelf.map((book) => (
                  <article key={book.id} className={styles.bookSlot} role="listitem" aria-label={book.title}>
                    <div className={styles.bookStage}>
                      <InteractiveBook
                        title={book.title}
                        eyebrow={book.eyebrow}
                        description={book.description}
                        coverSrc={book.coverSrc}
                        spineSrc={book.spineSrc}
                        showSpineLabel={book.showSpineLabel}
                        width={bookDisplaySizes.width}
                        height={bookDisplaySizes.height}
                        spineWidth={bookDisplaySizes.spineWidth}
                        showMetadata={false}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className={styles.shelfBoard} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
