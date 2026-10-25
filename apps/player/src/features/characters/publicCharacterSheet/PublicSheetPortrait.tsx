'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './PublicCharacterSheet.module.scss';

// Keep image recovery isolated so the sheet itself can render on the server.
export function PublicSheetPortrait({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = avatarUrl && /^https?:\/\//i.test(avatarUrl) ? avatarUrl : null;
  return url && failedUrl !== url
    ? <Image unoptimized src={url} width={240} height={310} alt="" className={styles.avatar} onError={() => setFailedUrl(url)} />
    : <span className={styles.monogram} aria-hidden="true">{name.slice(0, 1).toUpperCase() || 'T'}</span>;
}
