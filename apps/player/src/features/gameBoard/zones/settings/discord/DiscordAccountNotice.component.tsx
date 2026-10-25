'use client';

import { useState } from 'react';
import { Button } from '@tapestry/ui';
import { useDiscordAccount } from './DiscordAccount.hooks';
import { DiscordAccountModal } from './DiscordAccount.modal';
import type { DiscordAccountNoticeProps } from './DiscordAccount.types';
import styles from './DiscordAccount.module.scss';

export default function DiscordAccountNotice({ campaignId, playerId }: DiscordAccountNoticeProps) {
  const { status, account, authorize, unlink, error } = useDiscordAccount(campaignId);
  const dismissKey = `tapestry:discord-reminder:${playerId}:${campaignId}`;
  const [dismissed, setDismissed] = useState(() => {
    try { return typeof window !== 'undefined' && sessionStorage.getItem(dismissKey) === 'dismissed'; } catch { return false; }
  });
  const [opened, setOpened] = useState(false);
  const required = account?.requirement === 'required' && !account.linked;
  const close = () => {
    setOpened(false);
    setDismissed(true);
    try { sessionStorage.setItem(dismissKey, 'dismissed'); } catch { /* Component state still preserves dismissal while playing. */ }
  };
  if (status.isPending) return null;
  if (status.isError || !account) return <div className={styles.accountBar}><span>Discord link status unavailable.</span><Button size="sm" variant="ghost" onClick={() => void status.refetch()}>Retry</Button></div>;
  return <>
    <div className={`${styles.accountBar} ${required ? styles.required : ''}`}>
      <span>{required ? 'This campaign requires a linked Discord account. You can keep playing while you link it.' : account.linked ? 'Discord account linked' : 'Discord account linking is optional'}</span>
      <Button size="sm" variant={required ? 'outline' : 'ghost'} onClick={() => setOpened(true)}>{account.linked ? 'Manage account link' : 'Link Discord'}</Button>
    </div>
    <DiscordAccountModal open={opened || Boolean(required && !dismissed)} account={account} busy={authorize.isPending || unlink.isPending} error={error} onClose={close} onLink={() => authorize.mutate()} onUnlink={() => unlink.mutate()} />
  </>;
}
