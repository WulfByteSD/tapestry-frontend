'use client';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Button } from '@tapestry/ui';
import { bookStreamUrl } from './ResourceLibrary.api';
import type { PublicBook } from './ResourceLibrary.types';
import styles from './ResourceLibrary.module.scss';

export function DownloadPdf({ book }: { book: PublicBook }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const controller = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  useEffect(() => () => { controller.current?.abort(); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  async function download(event: MouseEvent<HTMLButtonElement>) {
    const trigger = event.currentTarget;
    const restoreFocus = document.activeElement === trigger;
    if (controller.current) return;
    const request = new AbortController(); controller.current = request;
    setState('loading');
    const timer = window.setTimeout(() => request.abort(), 45000);
    try {
      const response = await fetch(bookStreamUrl(book), { signal: request.signal });
      if (!response.ok) throw new Error('Unavailable');
      const blob = await response.blob();
      if ((await blob.slice(0, 5).text()) !== '%PDF-') throw new Error('Invalid PDF');
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const anchor = document.createElement('a');
      anchor.href = objectUrl.current; anchor.download = book.slug + '.pdf';
      document.body.append(anchor); anchor.click(); anchor.remove();
      setState('success');
    } catch { if (!request.signal.aborted || controller.current === request) setState('error'); }
    finally {
      window.clearTimeout(timer);
      if (controller.current === request) controller.current = null;
      if (restoreFocus) window.requestAnimationFrame(() => {
        if (trigger.isConnected && document.activeElement === document.body) trigger.focus();
      });
    }
  }
  return <div>
    <div className={styles.actions}>
      <Button type="button" onClick={download} isLoading={state === 'loading'}>{state === 'loading' ? 'Preparing PDF…' : 'Download free PDF'}</Button>
      <a className={styles.textLink} href={bookStreamUrl(book)} target="_blank" rel="noopener noreferrer">Read in your browser <span aria-hidden="true">↗</span><span className={styles.srOnly}> (opens a new tab)</span></a>
    </div>
    {state === 'error' ? <p role="alert" className={styles.feedback}>The PDF could not be downloaded. Please try again in a moment.</p> : <p role="status" className={styles.feedback}>{state === 'success' ? 'Your PDF is ready. Check your browser’s downloads.' : 'Free PDF · No account required'}</p>}
  </div>;
}
