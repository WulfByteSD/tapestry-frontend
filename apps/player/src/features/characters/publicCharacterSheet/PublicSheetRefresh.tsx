'use client';

import { useState, useTransition } from 'react';
import { Button } from '@tapestry/ui';
import { FiRefreshCw } from 'react-icons/fi';
import { refreshPublicCharacter } from './PublicSheetRefresh.actions';
import styles from './PublicCharacterSheet.module.scss';

export function PublicSheetRefresh({ identifier }: { identifier: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  function refresh() {
    setMessage('');
    startTransition(async () => {
      try {
        const result = await refreshPublicCharacter(identifier);
        setMessage(result.message);
      } catch {
        setMessage('Could not refresh the sheet. Please try again in a moment.');
      }
    });
  }

  return (
    <div className={styles.refresh}>
      <Button className={styles.refreshButton} size="sm" variant="outline" tone="neutral" onClick={refresh} isLoading={isPending} aria-label={isPending ? 'Refreshing sheet' : 'Refresh sheet'} title="Refresh sheet">
        {!isPending && <FiRefreshCw aria-hidden="true" />}
      </Button>
      <span role="status" aria-live="polite">{isPending ? 'Refreshing sheet…' : message}</span>
    </div>
  );
}
