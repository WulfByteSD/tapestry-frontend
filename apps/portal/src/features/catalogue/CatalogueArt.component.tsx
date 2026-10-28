'use client';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Catalogue.module.scss';
export function CatalogueArt({ title, src, alt, variant = 'cover' }: { title: string; src?: string; alt?: string; variant?: 'cover' | 'product' | 'marketing' | 'gallery' }) {
  const [failed, setFailed] = useState<string>();
  return <div className={variant === 'cover' ? styles.cover : `${styles.picture} ${variant === 'product' ? styles.productImage : ''}`}>
    {src && failed !== src ? <Image unoptimized src={src} alt={alt ?? title + (variant === 'cover' ? ' cover' : ' artwork')} width={1000} height={750} onError={() => setFailed(src)} />
      : <div className={styles.fallback}><span>TAPESTRY</span><strong>{title}</strong><span>{variant === 'cover' ? 'Cover image unavailable' : 'Image unavailable'}</span></div>}
  </div>;
}
