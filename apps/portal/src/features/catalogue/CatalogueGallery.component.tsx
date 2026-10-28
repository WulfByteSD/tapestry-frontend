'use client';
import { useRef, useState } from 'react';
import { CatalogueArt } from './CatalogueArt.component';
import type { CatalogueProduct } from './Catalogue.api';
import styles from './Catalogue.module.scss';

export function CatalogueGallery({ title, images }: { title: string; images: CatalogueProduct['gallery'] }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const image = images[selected] || images[0];
  if (!image) return null;
  return <section className={styles.gallery} aria-label={title + ' image gallery'}><h2>In pictures</h2>
    <figure id="product-gallery-image"><CatalogueArt variant="gallery" title={title} src={image.url} alt={image.alt} />
      <figcaption aria-live="polite">Image {selected + 1} of {images.length}{image.caption ? ' — ' + image.caption : ''}</figcaption></figure>
    {images.length > 1 ? <div className={styles.thumbnails} role="group" aria-label="Choose a preview image">{images.map((item, index) => <button type="button" key={item.url + index}
      ref={element => { buttons.current[index] = element; }} aria-pressed={index === selected} aria-controls="product-gallery-image" aria-label={'Show image ' + (index + 1) + ': ' + item.alt}
      onClick={() => setSelected(index)} onKeyDown={event => {
        let next: number;
        if (event.key === 'ArrowRight') next = (index + 1) % images.length;
        else if (event.key === 'ArrowLeft') next = (index + images.length - 1) % images.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = images.length - 1;
        else return;
        event.preventDefault(); setSelected(next); buttons.current[next]?.focus();
      }}><CatalogueArt variant="gallery" title={title} src={item.url} alt="" /><span>{index + 1}</span></button>)}</div> : null}
  </section>;
}
