'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@tapestry/ui';
import { useMe } from '@/lib/auth-hooks';
import { finishDiscordAuthorization } from '@/features/gameBoard/zones/settings/discord/DiscordCallback.helpers';
import type { DiscordCallbackResult } from '@/features/gameBoard/zones/settings/discord/DiscordIntegration.types';
import styles from '@/features/gameBoard/zones/settings/discord/DiscordIntegration.module.scss';

export default function DiscordCallbackPage() {
  const { data: user, isLoading, isError } = useMe();
  const started = useRef(false);
  const [result, setResult] = useState<DiscordCallbackResult | null>(null);

  useEffect(() => {
    if (isLoading || started.current) return;
    started.current = true;
    void finishDiscordAuthorization(Boolean(user) && !isError).then((response) => {
      if (response.error) setResult(response);
      else window.location.replace(response.path);
    }).catch(() => setResult({ path: '/games', error: 'Could not complete Discord authorization. Return to your campaign and try again.' }));
  }, [isLoading, user, isError]);

  return <main className={`${styles.integration} ${styles.callback}`}>
    <h3>Discord authorization</h3>
    {result?.error ? <><p role="alert" className={styles.error}>{result.error}</p><Button onClick={() => window.location.assign(result.path)}>Return to campaign</Button></> : <p role="status">Verifying your Discord account and returning to your campaign…</p>}
  </main>;
}
